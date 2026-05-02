/**
 * Remove white background from brand logos to make them transparent.
 * The original PNGs from the designer have white backgrounds.
 * We need transparent PNGs for proper rendering on any background.
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const brandDir = "public/brand";

async function removeWhiteBg(inputPath, outputPath) {
  // Read the image as raw pixel data
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const outputData = Buffer.from(data);

  // Process each pixel: if it's very light (near white), make it transparent
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate brightness (0-255)
    const brightness = (r + g + b) / 3;

    // If pixel is near-white (brightness > 240), make fully transparent
    if (brightness > 240) {
      outputData[i + 3] = 0; // Set alpha to 0
    }
    // If pixel is light (brightness 220-240), make semi-transparent for anti-aliasing
    else if (brightness > 220) {
      const alpha = Math.round(((240 - brightness) / 20) * 255);
      outputData[i + 3] = Math.min(alpha, data[i + 3]);
    }
    // Otherwise keep the pixel as-is (the logo graphics)
  }

  await sharp(outputData, {
    raw: { width, height, channels },
  })
    .png()
    .toFile(outputPath);

  console.log(`✓ ${path.basename(outputPath)} — transparent bg`);
}

async function run() {
  const files = [
    "symbol-dark.png",
    "symbol-light.png",
    "wordmark-dark.png",
    "wordmark-light.png",
  ];

  for (const file of files) {
    const input = path.join(brandDir, file);
    const output = path.join(brandDir, file); // overwrite with transparent version
    await removeWhiteBg(input, output);
  }

  // Now regenerate favicon and PWA icons from the cleaned transparent symbol
  const symbolDark = path.join(brandDir, "symbol-dark.png");

  // Trim whitespace from symbol
  const trimmed = await sharp(symbolDark).trim().toBuffer();

  // Favicon 32x32 — transparent bg
  await sharp(trimmed)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/favicon-32x32.png");
  console.log("✓ favicon-32x32.png (transparent)");

  // Favicon 16x16 — transparent bg
  await sharp(trimmed)
    .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/favicon-16x16.png");
  console.log("✓ favicon-16x16.png (transparent)");

  // Apple touch icon 180x180 — Apple requires white bg
  await sharp(trimmed)
    .resize(150, 150, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({ top: 15, bottom: 15, left: 15, right: 15, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile("public/apple-touch-icon.png");
  console.log("✓ apple-touch-icon.png");

  // PWA icons — transparent bg
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  for (const size of sizes) {
    const inner = Math.round(size * 0.68);
    const pad = Math.round((size - inner) / 2);

    const symbolResized = await sharp(trimmed)
      .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: symbolResized, left: pad, top: pad }])
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`);

    console.log(`✓ icon-${size}x${size}.png (transparent bg)`);
  }

  console.log("\n✅ All brand assets now have transparent backgrounds!");
}

run().catch(console.error);
