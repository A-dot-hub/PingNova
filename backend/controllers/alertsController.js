import { AlertModel } from "../models/alert.js";

export const getAlerts = async (req, res) => {
  try {
    const alerts = await AlertModel.getAll();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};
