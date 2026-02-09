import fs from "fs";
import path from "path";
import sharp from "sharp";
import { formatScoreCardDate } from "../utils/dateFormat";

const WIDTH = 1280;
const HEIGHT = 720;
const LEFT_PANEL_WIDTH = Math.round(WIDTH / 3); 
const RIGHT_PANEL_X = LEFT_PANEL_WIDTH;
const RIGHT_PANEL_WIDTH = WIDTH - LEFT_PANEL_WIDTH;
const RIGHT_PANEL_CENTER_X = RIGHT_PANEL_X + RIGHT_PANEL_WIDTH / 2;


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
      .title { font-family: 'Poppins', Arial, sans-serif; fill: #000000; font-size: 42px; font-weight: 700; }
      .userName { font-family: 'Poppins', Arial, sans-serif; fill: #0000ff; font-size: 28px; font-weight: 600; }
      .totalScore { font-family: 'Poppins', Arial, sans-serif; fill: #000000; font-size: 26px; font-weight: 500; }
      .dateStr { font-family: 'Poppins', Arial, sans-serif; fill: #000000; font-size: 24px; }
      .rankLeft { font-family: 'Poppins', Arial, sans-serif; fill: #ffffff; font-size: 140px; font-weight: 700; text-anchor: middle; }
    </style>
  </defs>
  <!-- Left panel: black background, RANK in white (reference: black section shows rank) -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="#000000" stroke-width="2"/>
  <rect width="${LEFT_PANEL_WIDTH}" height="${HEIGHT}" fill="#000000"/>
  <text x="${leftCenterX}" y="${leftCenterY}" text-anchor="middle" dominant-baseline="middle" class="rankLeft">${rank}</text>
  <!-- Right panel: white background, details -->
  <rect x="${RIGHT_PANEL_X}" width="${RIGHT_PANEL_WIDTH}" height="${HEIGHT}" fill="#ffffff"/>
  <line x1="${RIGHT_PANEL_X}" y1="0" x2="${RIGHT_PANEL_X}" y2="${HEIGHT}" stroke="#e0e0e0" stroke-width="1"/>
  <text x="${RIGHT_PANEL_CENTER_X}" y="180" text-anchor="middle" class="title">Score Card</text>
  <text x="${RIGHT_PANEL_CENTER_X}" y="280" text-anchor="middle" class="userName">${escapeXml(userName)}</text>
  <text x="${RIGHT_PANEL_CENTER_X}" y="380" text-anchor="middle" class="totalScore">Total Score: ${totalScore}</text>
  <text x="${RIGHT_PANEL_CENTER_X}" y="460" text-anchor="middle" class="dateStr">Date: ${dateStr}</text>
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
