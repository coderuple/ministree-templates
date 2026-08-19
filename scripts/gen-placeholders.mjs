/**
 * Generates labeled duotone placeholder images for every image slot —
 * written as real .jpg/.png files, so you can replace them with real
 * photos at the exact same paths (no config changes needed).
 *
 * Existing files are SKIPPED so your real photos are never overwritten.
 * Re-run anytime with:  node scripts/gen-placeholders.mjs
 * Force-regenerate everything (overwrites real photos too!):  --force
 */
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const force = process.argv.includes("--force");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const svg = (w, h, label, sub) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1d130a"/>
      <stop offset="0.55" stop-color="#3a2412"/>
      <stop offset="1" stop-color="#160d07"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect x="14" y="14" width="${w - 28}" height="${h - 28}" fill="none" stroke="#d9a441" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="10 8"/>
  <text x="50%" y="48%" text-anchor="middle" fill="#d9a441" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(w / 22)}" font-weight="bold" letter-spacing="6">${label}</text>
  <text x="50%" y="56%" text-anchor="middle" fill="#8d7f68" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(w / 40)}" letter-spacing="3">${sub} · ${w}×${h}</text>
</svg>
`;

const photos = [
  ["public/images/speakers/darlene-zschech.jpg", 900, 1200, "DARLENE ZSCHECH", "PORTRAIT 3:4"],
  ["public/images/speakers/nathaniel-bassey.jpg", 900, 1200, "NATHANIEL BASSEY", "PORTRAIT 3:4"],
  ["public/images/speakers/chevelle-franklyn.jpg", 900, 1200, "CHEVELLE FRANKLYN", "PORTRAIT 3:4"],
  ["public/images/speakers/sunmisola-agbebi.jpg", 900, 1200, "SUNMISOLA AGBEBI", "PORTRAIT 3:4"],
  ["public/images/speakers/mogmusic.jpg", 900, 1200, "MOGMUSIC", "PORTRAIT 3:4"],
  ["public/images/speakers/lou-fellingham.jpg", 900, 1200, "LOU FELLINGHAM", "PORTRAIT 3:4"],
  ["public/images/hero/keyart.jpg", 1920, 1080, "OFFICIAL KEY ART", "POSTER 16:9"],
  ["public/images/bg/cathedral-texture.jpg", 1920, 1280, "CATHEDRAL TEXTURE", "BACKGROUND"],
  ["public/images/venue/ovo-arena-1.jpg", 1600, 1000, "OVO ARENA — INTERIOR", "VENUE 16:10"],
  ["public/images/venue/ovo-arena-2.jpg", 900, 1200, "CROWD IN WORSHIP", "VENUE 3:4"],
  ["public/images/venue/ovo-arena-3.jpg", 900, 1200, "ARENA AT NIGHT", "VENUE 3:4"],
  ["public/images/og/og-image.jpg", 1200, 630, "THE ALTAR 2026", "SOCIAL CARD — REPLACE WITH KEY ART"],
];

for (const [path, w, h, label, sub] of photos) {
  const full = join(root, path);
  if (existsSync(full) && !force) {
    console.log("skipped (exists)", path);
    continue;
  }
  mkdirSync(dirname(full), { recursive: true });
  await sharp(Buffer.from(svg(w, h, label, sub)))
    .jpeg({ quality: 88 })
    .toFile(full);
  console.log("created", path);
}

// Host logo — PNG with transparency
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 640 160">
  <text x="0" y="104" fill="#f2e9d8" font-family="Helvetica, Arial, sans-serif" font-size="68" font-weight="bold" letter-spacing="8">JESUS HOUSE</text>
</svg>
`;
const logoPath = join(root, "public/images/logos/jesus-house.png");
if (existsSync(logoPath) && !force) {
  console.log("skipped (exists) public/images/logos/jesus-house.png");
} else {
  mkdirSync(dirname(logoPath), { recursive: true });
  await sharp(Buffer.from(logo)).png().toFile(logoPath);
  console.log("created public/images/logos/jesus-house.png");
}
