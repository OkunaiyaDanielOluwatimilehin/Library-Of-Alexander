import { Router } from "express";
import { getOriginalBooks } from "../services/books.service.js";

const router = Router();

router.get("/cms/original-books", async (req, res) => {
  try {
    const data = await getOriginalBooks();
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
