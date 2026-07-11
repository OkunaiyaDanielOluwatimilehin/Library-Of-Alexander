import { Router } from "express";
import { getRankings } from "../services/rankings.service.js";

const router = Router();

router.get("/cms/rankings", async (req, res) => {
  try {
    const { isContentful, data, lists } = await getRankings();
    res.json({ isContentful, data, lists });
  } catch (e: any) {
    res.status(500).json({
      isContentful: false,
      error: e.message || "Query Failed",
      data: []
    });
  }
});

export default router;
