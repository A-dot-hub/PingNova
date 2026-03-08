import express from "express";
import { getHistory } from "../controllers/historyController.js";

const router = express.Router();

router.get("/", getHistory);
router.get("/:websiteId", getHistory);

export default router;
