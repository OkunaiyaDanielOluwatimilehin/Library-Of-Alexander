import { Router } from "express";
import { getCharacters } from "../services/books.service.js";

const router = Router();

router.get("/cms/characters", async (req, res) => {
  try {
    const result = await getCharacters();
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
