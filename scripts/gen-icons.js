const sharp = require("sharp");
const path = require("path");

const OUT = path.join(__dirname, "..", "public", "icons");
const INK = "#08090C";
const JADE = "#00A870";

function markSvg({ size, bg, rounded, markScale }) {
  const r = rounded ? Math.round(size * 0.1875) : 0;
  const pad = (size - size * markScale) / 2;
  const markSize = size * markScale;
  const s = markSize / 24;
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/>
  <g transform="translate(${pad},${pad}) scale(${s})">
    <polyline points="2,19 8,12 13,15 22,3" fill="none" stroke="${JADE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

async function make(name, size, opts) {
  const svg = markSvg({ size, ...opts });
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, name));
  console.log("wrote", name);
}

(async () => {
  await make("icon-192.png", 192, { bg: INK, rounded: true, markScale: 0.58 });
  await make("icon-512.png", 512, { bg: INK, rounded: true, markScale: 0.58 });
  await make("maskable-icon-192.png", 192, { bg: INK, rounded: false, markScale: 0.5 });
  await make("maskable-icon-512.png", 512, { bg: INK, rounded: false, markScale: 0.5 });
  await make("apple-touch-icon.png", 180, { bg: INK, rounded: false, markScale: 0.5 });
})();
