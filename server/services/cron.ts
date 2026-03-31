import cron from 'node-cron';
import { pool } from '../db/index.js';
import nodemailer from 'nodemailer';

// Configure Nodemailer (Use your own SMTP credentials in production)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass'
  }
});

async function sendAlert(destination: string, type: string, monitorName: string, status: string, url: string) {
  const message = `Monitor ${monitorName} (${url}) is currently ${status.toUpperCase()}.`;
  
  if (type === 'email') {
    try {
      await transporter.sendMail({
        from: '"PingNova Alerts" <alerts@pingnova.com>',
        to: destination,
        subject: `[PingNova] Monitor Alert: ${monitorName} is ${status.toUpperCase()}`,
        text: message
      });
      console.log(`Email alert sent to ${destination} for ${monitorName}`);
    } catch (error) {
      console.error(`Failed to send email alert to ${destination}:`, error);
    }
  } else if (type === 'webhook') {
    try {
      await fetch(destination, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monitorName, url, status, message })
      });
      console.log(`Webhook alert sent to ${destination} for ${monitorName}`);
    } catch (error) {
      console.error(`Failed to send webhook alert to ${destination}:`, error);
    }
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

        // If status changed to down, trigger alerts
        if (monitor.status === 'up' && newStatus === 'down') {
          const [alerts]: any = await pool.query('SELECT * FROM alerts WHERE monitor_id = ?', [monitor.id]);
          for (const alert of alerts) {
            await sendAlert(alert.destination, alert.type, monitor.name, newStatus, monitor.url);
          }
        }
        
        // If status changed to up, trigger recovery alerts
        if (monitor.status === 'down' && newStatus === 'up') {
            const [alerts]: any = await pool.query('SELECT * FROM alerts WHERE monitor_id = ?', [monitor.id]);
            for (const alert of alerts) {
              await sendAlert(alert.destination, alert.type, monitor.name, newStatus, monitor.url);
            }
        }
      }
    }
  } catch (error) {
    console.error('Error checking monitors:', error);
  }
}

export function startCronJobs() {
  // Run every minute
  cron.schedule('* * * * *', () => {
    console.log('Running monitor checks...');
    checkMonitors();
  });
}
