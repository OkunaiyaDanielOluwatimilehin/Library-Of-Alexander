import { Router } from "express";

const router = Router();

router.get("/cms/collections", async (req, res) => {
  res.json({ data: [] });
});

export default router;
