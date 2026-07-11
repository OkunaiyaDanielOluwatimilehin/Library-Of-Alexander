import { Router } from "express";
import { getCategories } from "../services/books.service.js";

const router = Router();

router.get("/cms/categories", async (req, res) => {
  try {
    const result = await getCategories();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({
      isContentful: false,
      error: e.message || "Query Failed",
      data: []
    });
  }
});

export default router;
