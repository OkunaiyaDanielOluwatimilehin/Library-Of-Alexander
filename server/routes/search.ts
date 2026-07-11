import { Router } from "express";
import { searchCMS } from "../services/search.service.ts";

const router = Router();

router.get("/cms/search", async (req, res) => {
  const query = (req.query.q as string) || "";
  const results = await searchCMS(query);
  res.json({ data: results });
});

export default router;
