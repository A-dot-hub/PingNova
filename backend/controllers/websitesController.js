import { WebsiteModel } from "../models/website.js";

export const getWebsites = async (req, res) => {
  try {
    const websites = await WebsiteModel.getAll();
    res.json(websites);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch websites" });
  }
};

export const addWebsite = async (req, res) => {
  try {
    const { url, checkFrequency, alertEmail } = req.body;
    if (!url || !checkFrequency || !alertEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newSite = await WebsiteModel.add({ url, checkFrequency, alertEmail });
    res.status(201).json(newSite);
  } catch (error) {
    res.status(500).json({ error: "Failed to add website" });
  }
};

export const removeWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    await WebsiteModel.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove website" });
  }
};
