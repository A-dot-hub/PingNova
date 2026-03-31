import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
}));
app.use(cors());
app.use(express.json());

// API Routes
import authRoutes from './server/routes/auth.js';
import monitorRoutes from './server/routes/monitors.js';
import alertRoutes from './server/routes/alerts.js';

app.use('/api/auth', authRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PingNova API is running' });
});

// Initialize DB and Cron Jobs
import { initDB } from './server/db/init.js';
import { startCronJobs } from './server/services/cron.js';

async function startServer() {
  try {
    // Initialize Database
    await initDB();
    console.log('Database initialized successfully');

    // Start Cron Jobs
    startCronJobs();
    console.log('Cron jobs started');

    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
