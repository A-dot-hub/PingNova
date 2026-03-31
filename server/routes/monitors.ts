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
    const [monitors]: any = await pool.query(
      'SELECT * FROM monitors WHERE user_id = ? ORDER BY created_at DESC',
      [req.user?.id]
    );
    res.json(monitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// Get single monitor with history
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [monitors]: any = await pool.query(
      'SELECT * FROM monitors WHERE id = ? AND user_id = ?',
      [req.params.id, req.user?.id]
    );

    if (monitors.length === 0) return res.status(404).json({ error: 'Monitor not found' });

    const [pings]: any = await pool.query(
      'SELECT * FROM pings WHERE monitor_id = ? ORDER BY checked_at DESC LIMIT 100',
      [req.params.id]
    );

    res.json({ monitor: monitors[0], history: pings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monitor' });
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
