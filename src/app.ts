import express from "express";
import path from "path";
import { authRoutes } from "./routes/auth.routes";
import { scoreRoutes } from "./routes/score.routes";

const app = express();

app.use(express.json());
const publicDir = path.join(process.cwd(), "public");
app.use("/public", express.static(publicDir));
app.use("/auth", authRoutes);
app.use("/score", scoreRoutes);

export default app;
