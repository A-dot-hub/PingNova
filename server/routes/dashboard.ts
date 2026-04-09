import express from 'express';
import { pool } from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { timeRange = '24h' } = req.query;

    // Get total monitors and status counts
    const [monitors]: any = await pool.query('SELECT status, COUNT(*) as count FROM monitors WHERE user_id = ? GROUP BY status', [userId]);
    
    let totalMonitors = 0;
    let upMonitors = 0;
    let downMonitors = 0;
    let pausedMonitors = 0;

    monitors.forEach((m: any) => {
      totalMonitors += m.count;
      if (m.status === 'up') upMonitors += m.count;
      if (m.status === 'down') downMonitors += m.count;
      if (m.status === 'paused') pausedMonitors += m.count;
    });

    // Get active alerts
    const [alerts]: any = await pool.query(`
      SELECT COUNT(*) as count FROM alerts a
      JOIN monitors m ON a.monitor_id = m.id
      WHERE m.user_id = ?
    `, [userId]);
    const activeAlerts = alerts[0].count;

    // Determine time filter for pings
    let timeFilter = '';
    if (timeRange === '24h') timeFilter = 'AND p.checked_at >= NOW() - INTERVAL 1 DAY';
    else if (timeRange === '7d') timeFilter = 'AND p.checked_at >= NOW() - INTERVAL 7 DAY';
    else if (timeRange === '30d') timeFilter = 'AND p.checked_at >= NOW() - INTERVAL 30 DAY';
    else timeFilter = 'AND p.checked_at >= NOW() - INTERVAL 1 DAY';

    // Get average response time and uptime %
    const [pingStats]: any = await pool.query(`
      SELECT 
        AVG(p.response_time_ms) as avg_response_time,
        SUM(CASE WHEN p.status = 'up' THEN 1 ELSE 0 END) as up_pings,
        COUNT(p.id) as total_pings
      FROM pings p
      JOIN monitors m ON p.monitor_id = m.id
      WHERE m.user_id = ? ${timeFilter}
    `, [userId]);

    const stats = pingStats[0];
    const avgResponseTime = stats.avg_response_time ? Math.round(stats.avg_response_time) : 0;
    const uptimePercent = stats.total_pings > 0 ? ((stats.up_pings / stats.total_pings) * 100).toFixed(2) : 100;

    // Get downtime analysis
    const [downtimeStats]: any = await pool.query(`
      SELECT 
        COUNT(*) as incident_count,
        SUM(TIMESTAMPDIFF(MINUTE, p.checked_at, NOW())) as total_downtime_minutes
      FROM pings p
      JOIN monitors m ON p.monitor_id = m.id
      WHERE m.user_id = ? AND p.status = 'down' ${timeFilter}
    `, [userId]);

    const downtime = downtimeStats[0];

    // Get history for charts (grouped by hour or day depending on timeRange)
    let groupBy = 'DATE_FORMAT(p.checked_at, "%Y-%m-%d %H:00:00")';
    if (timeRange === '7d' || timeRange === '30d') {
      groupBy = 'DATE(p.checked_at)';
    }

    const [history]: any = await pool.query(`
      SELECT 
        ${groupBy} as time,
        AVG(p.response_time_ms) as avg_response_time,
        (SUM(CASE WHEN p.status = 'up' THEN 1 ELSE 0 END) / COUNT(p.id)) * 100 as uptime_percent
      FROM pings p
      JOIN monitors m ON p.monitor_id = m.id
      WHERE m.user_id = ? ${timeFilter}
      GROUP BY time
      ORDER BY time ASC
    `, [userId]);

    res.json({
      totalMonitors,
      upMonitors,
      downMonitors,
      pausedMonitors,
      activeAlerts,
      avgResponseTime,
      uptimePercent,
      downtime: {
        incidents: downtime.incident_count || 0,
        totalMinutes: downtime.total_downtime_minutes || 0
      },
      history
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;