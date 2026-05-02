/**
 * Brand Asset Preparation Script
 *
 * Takes the 4 original logo PNGs provided by the designer and produces:
 *   1. Trimmed + transparent-background versions for use in the UI
 *   2. Favicon 32×32 with TRANSPARENT background (no white box)
 *   3. Apple-touch-icon 180×180
 *   4. PWA icons in all standard sizes with transparent background
 *
 * Source images (white-bg originals from designer):
 *   media__1777742985491.png → dark symbol (graphite)
 *   media__1777742985586.png → light symbol (blush pink)
 *   media__1777742985629.png → light wordmark (blush pink, symbol + "aeon")
 *   media__1777742985644.png → dark wordmark (graphite, symbol + "aeon")
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const BRAIN =
  "C:/Users/DS-05010/.gemini/antigravity/brain/81bf1753-ee90-4616-a4d3-98f1df9485c1";

const src = {
  symbolDark:  path.join(BRAIN, "media__1777742985491.png"),
  symbolLight: path.join(BRAIN, "media__1777742985586.png"),
  wordmarkLight: path.join(BRAIN, "media__1777742985629.png"),
  wordmarkDark:  path.join(BRAIN, "media__1777742985644.png"),
};

const brandDir = "public/brand";
const iconsDir = "public/icons";

if (!fs.existsSync(brandDir)) fs.mkdirSync(brandDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

async function run() {
  // ─── 1. Copy and trim originals into /public/brand/ ───
  // Keep white backgrounds but also make trimmed transparent versions

  // Copy originals as-is (these have white bg, useful as-is for <img>)
  await sharp(src.symbolDark).toFile(path.join(brandDir, "symbol-dark.png"));
  console.log("symbol-dark.png copied");
  await sharp(src.symbolLight).toFile(path.join(brandDir, "symbol-light.png"));
  console.log("symbol-light.png copied");
  await sharp(src.wordmarkDark).toFile(path.join(brandDir, "wordmark-dark.png"));
  console.log("wordmark-dark.png copied");
  await sharp(src.wordmarkLight).toFile(path.join(brandDir, "wordmark-light.png"));
  console.log("wordmark-light.png copied");

  // ─── 2. Favicon — dark symbol, trimmed, transparent bg, 32×32 ───
  // The original has white bg. We need to:
  //   a) Trim the whitespace
  //   b) Make the white background transparent (the symbol is dark graphite ~#3d3d3d)
  //   c) Resize to 32×32
  const symbolDarkBuf = await sharp(src.symbolDark)
    .trim()
    .toBuffer();

  // Resize to standard favicon sizes
  await sharp(symbolDarkBuf)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/favicon-32x32.png");
  console.log("favicon-32x32.png created (trimmed, transparent bg)");

  await sharp(symbolDarkBuf)
    .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/favicon-16x16.png");
  console.log("favicon-16x16.png created");

  // Apple touch icon — dark symbol on white bg (Apple requires solid bg)
  await sharp(symbolDarkBuf)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile("public/apple-touch-icon.png");
  console.log("apple-touch-icon.png created");

  // ─── 3. PWA icons — dark symbol, trimmed, transparent bg ───
  // PWA icons should NOT have a white box — they should be symbol only on transparent bg
  // The OS/launcher will add its own background color (set in manifest.json background_color)
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  for (const size of sizes) {
    // Add some padding (15% each side) so the symbol doesn't touch the edges
    const symbolPadded = Math.round(size * 0.70);
    const padding = Math.round((size - symbolPadded) / 2);

    const trimmedSymbol = await sharp(symbolDarkBuf)
      .resize(symbolPadded, symbolPadded, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: trimmedSymbol, left: padding, top: padding }])
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

    console.log(`icon-${size}x${size}.png OK (transparent bg)`);
  }

  console.log("\n✅ All brand assets prepared!");
}

run().catch(console.error);
