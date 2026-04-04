import express from 'express';
import { pool } from '../db/index.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const monitorId = req.params.id;

    const [monitors]: any = await pool.query('SELECT name, url, status, created_at FROM monitors WHERE id = ?', [monitorId]);
    
    if (monitors.length === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const monitor = monitors[0];

    // Get 30-day uptime
    const [stats]: any = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) as up_pings,
        COUNT(id) as total_pings
      FROM pings 
      WHERE monitor_id = ? AND checked_at >= NOW() - INTERVAL 30 DAY
    `, [monitorId]);

    const uptimePercent = stats[0].total_pings > 0 ? ((stats[0].up_pings / stats[0].total_pings) * 100).toFixed(2) : 100;

    // Get recent incidents (last 10 down events)
    const [incidents]: any = await pool.query(`
      SELECT checked_at, status_code, response_time_ms
      FROM pings
      WHERE monitor_id = ? AND status = 'down'
      ORDER BY checked_at DESC
      LIMIT 10
    `, [monitorId]);

    res.json({
      monitor,
      uptimePercent,
      incidents
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

export default router;
