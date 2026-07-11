import { Router } from "express";
import { getHomepageConfig, getFooterConfig } from "../services/homepage.service.ts";

const router = Router();

router.get("/cms/homepage-config", async (req, res) => {
  try {
    const config = await getHomepageConfig();
    res.json({ isContentful: true, data: config });
  } catch (e: any) {
    res.status(500).json({
      isContentful: false,
      error: e.message || "Access Credentials Empty or Query Failed",
      data: null
    });
  }
});

router.get("/cms/footer-config", async (req, res) => {
  try {
    const config = await getFooterConfig();
    res.json({ isContentful: true, data: config });
  } catch (e: any) {
    res.status(500).json({
      isContentful: false,
      error: e.message || "Access Credentials Empty or Query Failed",
      data: null
    });
  }
});

export default router;
