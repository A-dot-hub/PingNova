import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import websitesRouter from "./routes/websites.js";
import historyRouter from "./routes/history.js";
import alertsRouter from "./routes/alerts.js";
import { startMonitoring } from "./utils/monitor.js";
import { createServer as createViteServer } from "vite";

const startServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to DB
  await connectDB();

  // API Routes
  app.use("/api/websites", websitesRouter);
  app.use("/api/history", historyRouter);
  app.use("/api/alerts", alertsRouter);

  // Start monitoring
  startMonitoring();

  // Vite middleware for frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
