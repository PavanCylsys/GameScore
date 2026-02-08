import fs from "fs";
import path from "path";
import sharp from "sharp";
import { formatScoreCardDate } from "../utils/dateFormat";

const WIDTH = 1280;
const HEIGHT = 720;
const LEFT_PANEL_WIDTH = Math.round(WIDTH / 3); 
const RIGHT_PANEL_X = LEFT_PANEL_WIDTH;
const RIGHT_PANEL_PADDING = 60;


export async function generateScoreCardImage(params: {
  userName: string;
  rank: number;
  totalScore: number;
  outputFilename: string;
}): Promise<string> {
  const { userName, rank, totalScore, outputFilename } = params;
  const dateStr = formatScoreCardDate(new Date());

  const leftCenterX = LEFT_PANEL_WIDTH / 2;
  const leftCenterY = HEIGHT / 2;

  const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .title { font-family: 'Poppins', Arial, sans-serif; fill: #000000; font-size: 48px; font-weight: 700; }
      .detail { font-family: 'Poppins', Arial, sans-serif; fill: #000000; font-size: 36px; }
      .scoreLeft { font-family: 'Poppins', Arial, sans-serif; fill: #ffffff; font-size: 120px; font-weight: 700; }
    </style>
  </defs>
  <!-- Left panel: black background, score in white -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="#000000" stroke-width="2"/>
  <rect width="${LEFT_PANEL_WIDTH}" height="${HEIGHT}" fill="#000000"/>
  <text x="${leftCenterX}" y="${leftCenterY}" text-anchor="middle" dominant-baseline="middle" class="scoreLeft">${totalScore}</text>
  <!-- Right panel: white background, all details in black -->
  <rect x="${RIGHT_PANEL_X}" width="${WIDTH - LEFT_PANEL_WIDTH}" height="${HEIGHT}" fill="#ffffff"/>
  <line x1="${RIGHT_PANEL_X}" y1="0" x2="${RIGHT_PANEL_X}" y2="${HEIGHT}" stroke="#ffffff" stroke-width="2"/>
  <text x="${RIGHT_PANEL_X + RIGHT_PANEL_PADDING}" y="160" class="title">Score Card</text>
  <text x="${RIGHT_PANEL_X + RIGHT_PANEL_PADDING}" y="260" class="detail">${escapeXml(userName)}</text>
  <text x="${RIGHT_PANEL_X + RIGHT_PANEL_PADDING}" y="360" class="detail">Rank: ${rank}</text>
  <text x="${RIGHT_PANEL_X + RIGHT_PANEL_PADDING}" y="440" class="detail">Date: ${dateStr}</text>
</svg>`;

  const publicDir = path.join(process.cwd(), "public");
  fs.mkdirSync(publicDir, { recursive: true });
  const outputPath = path.join(publicDir, outputFilename);
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toFile(outputPath);
  return outputPath;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const imageService = {
  generateScoreCardImage,
  async upload(file: Buffer | string, options?: { folder?: string }) {
    return { url: "", key: "" };
  },
  async delete(key: string) {
    return true;
  },
};
