import { Router } from "express";
import { getAuthorSpotlight, getAuthors } from "../services/authors.service.ts";

const router = Router();

router.get("/cms/author-spotlight", async (req, res) => {
  try {
    const result = await getAuthorSpotlight();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({
      isContentful: false,
      error: e.message || "Access Credentials Empty or Query Failed",
      data: null
    });
  }
});

router.get("/cms/authors", async (req, res) => {
  try {
    const result = await getAuthors();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({
      isContentful: false,
      error: e.message || "Access Credentials Empty or Query Failed",
      data: []
    });
  }
});

export default router;
