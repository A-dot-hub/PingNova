import { HistoryModel } from "../models/history.js";

export const getHistory = async (req, res) => {
  try {
    const { websiteId } = req.params;
    if (websiteId) {
      const history = await HistoryModel.getByWebsiteId(websiteId);
      return res.json(history);
    }
    const history = await HistoryModel.getAll();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
