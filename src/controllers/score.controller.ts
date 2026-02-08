import { Request, Response } from "express";
import { scoreService } from "../services/score.service";
import { generateScoreCardImage } from "../services/image.service";
import { validateScore } from "../utils/validation";

function getUserId(req: Request): number | null {
  const user = (req as Request & { user?: { uid?: number } }).user;
  const uid = user?.uid;
  return typeof uid === "number" ? uid : null;
}

export const scoreController = {
  async saveScore(req: Request, res: Response) {
    const userId = getUserId(req);
    if (userId == null) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const scoreValidation = validateScore(req.body?.score);
    if (!scoreValidation.valid) {
      return res.status(400).json({ success: false, message: scoreValidation.message });
    }
    const score = Number(req.body.score);

    try {
      await scoreService.saveScore(userId, score);
      return res.json({ success: true, message: "Score saved" });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to save score";
      if (/score must be between|daily score limit exceeded|45000/i.test(msg)) {
        return res.status(400).json({ success: false, message: msg });
      }
      return res.status(500).json({ success: false, message: msg });
    }
  },

  async getScoreCard(req: Request, res: Response) {
    const userId = getUserId(req);
    if (userId == null) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { rank, totalScore, userName } = await scoreService.getUserRankTotalAndName(userId);
    const filename = `score_${userId}_${Date.now()}.jpg`;

    try {
      const outputPath = await generateScoreCardImage({
        userName,
        rank,
        totalScore,
        outputFilename: filename,
      });
      const relativePath = filename;
      const baseUrl = req.protocol + "://" + (req.get("host") || "localhost:3000");
      const imageUrl = `${baseUrl}/public/${relativePath}`;
      return res.json({ success: true, imageUrl });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to generate score card";
      return res.status(500).json({ success: false, message: msg });
    }
  },
};
