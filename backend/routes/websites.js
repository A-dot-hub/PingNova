import express from "express";
import {
  getWebsites,
  addWebsite,
  removeWebsite,
} from "../controllers/websitesController.js";

const router = express.Router();

router.get("/", getWebsites);
router.post("/", addWebsite);
router.delete("/:id", removeWebsite);

export default router;
