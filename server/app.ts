import express from "express";
import router from "./routes/index.js";

const app = express();
app.use(express.json());

// Add your middleware and routes here
app.use("/api", router);

export { app };
