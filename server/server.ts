import "dotenv/config";
import { app } from "./app.ts";
import path from "path";
import { createServer as createViteServer } from "vite";
import express from "express";


const PORT = 3000;

// Serve static files and mount Vite middleware
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

if (process.env.VERCEL !== "1") {
  setupViteOrStatic().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Library of Alexander server running at http://localhost:${PORT}`);
    });
  });
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export { app };
export default app;
