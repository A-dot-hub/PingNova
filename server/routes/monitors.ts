import express from 'express';
import { pool } from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { z, ZodError } from 'zod';

const router = express.Router();

const monitorSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  interval_minutes: z.number().min(1).max(60).default(5)
});

// Get all monitors for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM monitors WHERE user_id = ?';
    const params: any[] = [req.user?.id];

    if (search) {
      query += ' AND (name LIKE ? OR url LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [monitors]: any = await pool.query(query, params);
    res.json(monitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// Get single monitor with history
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { timeRange } = req.query; // e.g., '24h', '7d', '30d'
    
    const [monitors]: any = await pool.query(
      'SELECT * FROM monitors WHERE id = ? AND user_id = ?',
      [req.params.id, req.user?.id]
    );

    if (monitors.length === 0) return res.status(404).json({ error: 'Monitor not found' });

    let timeFilter = '';
    if (timeRange === '24h') timeFilter = 'AND checked_at >= NOW() - INTERVAL 1 DAY';
    else if (timeRange === '7d') timeFilter = 'AND checked_at >= NOW() - INTERVAL 7 DAY';
    else if (timeRange === '30d') timeFilter = 'AND checked_at >= NOW() - INTERVAL 30 DAY';
    else timeFilter = 'AND checked_at >= NOW() - INTERVAL 1 DAY'; // Default 24h

    const [pings]: any = await pool.query(
      `SELECT * FROM pings WHERE monitor_id = ? ${timeFilter} ORDER BY checked_at DESC`,
      [req.params.id]
    );

    res.json({ monitor: monitors[0], history: pings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monitor' });
  }
});

// Pause/Resume monitor
router.put('/:id/pause', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { paused } = req.body; // boolean
    const newStatus = paused ? 'paused' : 'up'; // Reset to 'up' when resuming, cron will update if down

    const [result]: any = await pool.query(
      'UPDATE monitors SET status = ? WHERE id = ? AND user_id = ?',
      [newStatus, req.params.id, req.user?.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Monitor not found' });

    res.json({ message: `Monitor ${paused ? 'paused' : 'resumed'} successfully`, status: newStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update monitor status' });
  }
});

// Create monitor
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, url, interval_minutes } = monitorSchema.parse(req.body);

    const [result]: any = await pool.query(
      'INSERT INTO monitors (user_id, name, url, interval_minutes, status) VALUES (?, ?, ?, ?, ?)',
      [req.user?.id, name, url, interval_minutes, 'up'] // Default to up initially
    );

    res.status(201).json({ id: result.insertId, name, url, interval_minutes, status: 'up' });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

// Update monitor
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, url, interval_minutes } = monitorSchema.parse(req.body);

    const [result]: any = await pool.query(
      'UPDATE monitors SET name = ?, url = ?, interval_minutes = ? WHERE id = ? AND user_id = ?',
      [name, url, interval_minutes, req.params.id, req.user?.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Monitor not found' });

    res.json({ message: 'Monitor updated successfully' });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update monitor' });
  }
});

// Delete monitor
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [result]: any = await pool.query(
      'DELETE FROM monitors WHERE id = ? AND user_id = ?',
      [req.params.id, req.user?.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Monitor not found' });

    res.json({ message: 'Monitor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete monitor' });
  }
});

export default router;
