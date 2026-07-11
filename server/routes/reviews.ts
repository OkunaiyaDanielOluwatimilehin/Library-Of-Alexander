import { Router } from "express";
import { getReviews } from "../services/reviews.service.ts";

const router = Router();

router.get("/cms/reviews", async (req, res) => {
  try {
    const data = await getReviews();
    res.json({ isContentful: true, data });
  } catch (e: any) {
    res.status(500).json({
      isContentful: false,
      error: e.message || "Access Credentials Empty or Query Failed",
      data: []
    });
  }
});

export default router;
