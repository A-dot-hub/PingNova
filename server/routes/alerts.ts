import express from 'express';
import { pool } from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { z, ZodError } from 'zod';

const router = express.Router();

const alertSchema = z.object({
  monitor_id: z.number(),
  type: z.enum(['email', 'webhook']),
  destination: z.string().min(1)
});

// Get alerts for a monitor
router.get('/:monitor_id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verify ownership
    const [monitors]: any = await pool.query(
      'SELECT id FROM monitors WHERE id = ? AND user_id = ?',
      [req.params.monitor_id, req.user?.id]
    );

    if (monitors.length === 0) return res.status(404).json({ error: 'Monitor not found' });

    const [alerts]: any = await pool.query(
      'SELECT * FROM alerts WHERE monitor_id = ?',
      [req.params.monitor_id]
    );

    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create alert
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { monitor_id, type, destination } = alertSchema.parse(req.body);

    // Verify ownership
    const [monitors]: any = await pool.query(
      'SELECT id FROM monitors WHERE id = ? AND user_id = ?',
      [monitor_id, req.user?.id]
    );

    if (monitors.length === 0) return res.status(404).json({ error: 'Monitor not found' });

    const [result]: any = await pool.query(
      'INSERT INTO alerts (monitor_id, type, destination) VALUES (?, ?, ?)',
      [monitor_id, type, destination]
    );

    res.status(201).json({ id: result.insertId, monitor_id, type, destination });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Delete alert
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Need to join to verify ownership
    const [alerts]: any = await pool.query(`
      SELECT a.id FROM alerts a
      JOIN monitors m ON a.monitor_id = m.id
      WHERE a.id = ? AND m.user_id = ?
    `, [req.params.id, req.user?.id]);

    if (alerts.length === 0) return res.status(404).json({ error: 'Alert not found' });

    await pool.query('DELETE FROM alerts WHERE id = ?', [req.params.id]);

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
