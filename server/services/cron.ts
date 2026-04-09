import cron from 'node-cron';
import { pool } from '../db/index.js';
import nodemailer from 'nodemailer';
import { sendSMS, logToCloudWatch } from './aws.js';

// Configure Nodemailer (Use your own SMTP credentials in production)
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass'
  }
});

async function sendAlert(destination: string, type: string, monitorName: string, status: string, url: string, userId: number) {
  const message = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  
  <h2 style="color: ${status === 'down' ? '#dc2626' : '#16a34a'};">
    ${status === 'down' ? '🚨 Monitor Down Alert' : '✅ Monitor Recovered'}
  </h2>

  <p style="color: #475569; line-height: 1.6;">
    Hi,
  </p>

  <p style="color: #475569; line-height: 1.6;">
    Your monitor <strong>${monitorName}</strong> is currently 
    <strong style="color: ${status === 'down' ? '#dc2626' : '#16a34a'};">
      ${status.toUpperCase()}
    </strong>.
  </p>

  <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
    <p style="margin: 6px 0;"><strong>🌐 URL:</strong> ${url}</p>
    <p style="margin: 6px 0;"><strong>📊 Status:</strong> ${status.toUpperCase()}</p>
    <p style="margin: 6px 0;"><strong>⏱ Time:</strong> ${new Date().toLocaleString()}</p>
  </div>

  ${
    status === "down"
      ? `
      <p style="color: #b91c1c; line-height: 1.6;">
        We detected that your service is not responding or returning an error.
        Our monitoring system will continue checking and notify you once it recovers.
      </p>
      `
      : `
      <p style="color: #065f46; line-height: 1.6;">
        Good news! Your service is back online and functioning normally.
      </p>
      `
  }

  <div style="margin-top: 30px; text-align: center;">
    <a href="${process.env.APP_URL || '#'}" 
       style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
      View Dashboard
    </a>
  </div>

  <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; text-align: center;">
    This is an automated alert from PingNova monitoring system.
  </p>

</div>`;
  
  // Fetch user preferences
  const [users]: any = await pool.query('SELECT email_alerts, sms_alerts, phone_number FROM users WHERE id = ?', [userId]);
  const user = users[0];

  if (type === 'email' && user?.email_alerts) {
    try {
      await transporter.sendMail({
        from: '"PingNova Alerts" <alerts@pingnova.com>',
        to: destination,
        subject: `[PingNova] Monitor Alert: ${monitorName} is ${status.toUpperCase()}`,
        text: message
      });
      await logToCloudWatch(`Email alert sent to ${destination} for ${monitorName}`, 'INFO');
    } catch (error) {
      await logToCloudWatch(`Failed to send email alert to ${destination}: ${error}`, 'ERROR');
    }
  } else if (type === 'webhook') {
    try {
      await fetch(destination, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monitorName, url, status, message })
      });
      await logToCloudWatch(`Webhook alert sent to ${destination} for ${monitorName}`, 'INFO');
    } catch (error) {
      await logToCloudWatch(`Failed to send webhook alert to ${destination}: ${error}`, 'ERROR');
    }
  }

  // Send SMS if enabled
  if (user?.sms_alerts && user?.phone_number) {
    await sendSMS(user.phone_number, `[PingNova] ${monitorName} is ${status.toUpperCase()}`);
  }
}

async function checkMonitors() {
  try {
    // Get all active monitors
    const [monitors]: any = await pool.query('SELECT * FROM monitors WHERE status != "paused"');

    for (const monitor of monitors) {
      // Check if it's time to ping based on interval
      const lastChecked = monitor.last_checked ? new Date(monitor.last_checked).getTime() : 0;
      const now = Date.now();
      const intervalMs = monitor.interval_minutes * 60 * 1000;

      if (now - lastChecked >= intervalMs) {
        let isUp = false;
        let responseTime = 0;
        let statusCode = 0;

        const startTime = Date.now();
        try {
          const response = await fetch(monitor.url, { method: 'GET', signal: AbortSignal.timeout(10000) });
          responseTime = Date.now() - startTime;
          statusCode = response.status;
          isUp = response.ok;
        } catch (error) {
          responseTime = Date.now() - startTime;
          isUp = false;
          statusCode = 0; // Network error or timeout
        }

        const newStatus = isUp ? 'up' : 'down';

        // Insert ping history
        await pool.query(
          'INSERT INTO pings (monitor_id, status, response_time_ms, status_code) VALUES (?, ?, ?, ?)',
          [monitor.id, newStatus, responseTime, statusCode]
        );

        // Update monitor status and last_checked
        await pool.query(
          'UPDATE monitors SET status = ?, last_checked = CURRENT_TIMESTAMP WHERE id = ?',
          [newStatus, monitor.id]
        );

        // If status changed, trigger alerts
        if (monitor.status !== newStatus && monitor.status !== 'paused') {
          const [alerts]: any = await pool.query('SELECT * FROM alerts WHERE monitor_id = ?', [monitor.id]);
          for (const alert of alerts) {
            await sendAlert(alert.destination, alert.type, monitor.name, newStatus, monitor.url, monitor.user_id);
          }
        }
      }
    }
  } catch (error) {
    await logToCloudWatch(`Error checking monitors: ${error}`, 'ERROR');
  }
}

export function startCronJobs() {
  // Run every minute
  cron.schedule('* * * * *', () => {
    checkMonitors();
  });
}