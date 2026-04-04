import express from 'express';
import { pool } from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { parse } from 'json2csv';
import { uploadToS3 } from '../services/aws.js';

const router = express.Router();

router.get('/:monitorId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const monitorId = req.params.monitorId;
    const userId = req.user?.id;

    // Verify ownership
    const [monitors]: any = await pool.query('SELECT * FROM monitors WHERE id = ? AND user_id = ?', [monitorId, userId]);
    if (monitors.length === 0) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const monitor = monitors[0];

    // Get ping history
    const [pings]: any = await pool.query('SELECT checked_at, status, response_time_ms, status_code FROM pings WHERE monitor_id = ? ORDER BY checked_at DESC', [monitorId]);

    if (pings.length === 0) {
      return res.status(400).json({ error: 'No data to export' });
    }

    // Convert to CSV
    const csv = parse(pings, { fields: ['checked_at', 'status', 'response_time_ms', 'status_code'] });

    // Upload to S3
    const filename = `export_${monitorId}_${Date.now()}.csv`;
    const url = await uploadToS3(filename, csv);

    if (url) {
      res.json({ url });
    } else {
      // Fallback if S3 is not configured: send raw CSV
      res.header('Content-Type', 'text/csv');
      res.attachment(filename);
      res.send(csv);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

export default router;
