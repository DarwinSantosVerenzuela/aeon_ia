/**
 * Crop brand images to their actual content — removes all empty whitespace.
 * The original PNGs are 1024×1024 squares but the content is a thin strip.
 * This trims them tightly so they render at proper size in the UI.
 *
 * DOES NOT touch favicon files (those are already perfect).
 */

const sharp = require("sharp");
const path = require("path");

const BRAIN =
  "C:/Users/DS-05010/.gemini/antigravity/brain/81bf1753-ee90-4616-a4d3-98f1df9485c1";

const brandDir = "public/brand";

async function cropToContent(inputPath, outputPath, label) {
  // Step 1: Trim whitespace using sharp's built-in trim
  const trimmed = await sharp(inputPath)
    .trim({ threshold: 20 }) // trim near-white pixels
    .toBuffer({ resolveWithObject: true });

  const { width, height } = trimmed.info;
  console.log(`${label}: ${width}×${height} (trimmed from 1024×1024)`);

  // Step 2: Save the tightly cropped result
  await sharp(trimmed.data).png().toFile(outputPath);
  console.log(`  → saved to ${outputPath}`);

  return { width, height };
}

async function run() {
  console.log("=== Cropping brand images to content ===\n");

  // Crop all 4 brand images from the originals
  const symbolDarkDims = await cropToContent(
    path.join(BRAIN, "media__1777742985491.png"),
    path.join(brandDir, "symbol-dark.png"),
    "symbol-dark"
  );

  await cropToContent(
    path.join(BRAIN, "media__1777742985586.png"),
    path.join(brandDir, "symbol-light.png"),
    "symbol-light"
  );

  const wordmarkDarkDims = await cropToContent(
    path.join(BRAIN, "media__1777742985644.png"),
    path.join(brandDir, "wordmark-dark.png"),
    "wordmark-dark"
  );

  await cropToContent(
    path.join(BRAIN, "media__1777742985629.png"),
    path.join(brandDir, "wordmark-light.png"),
    "wordmark-light"
  );

  console.log("\n=== Aspect ratios ===");
  console.log(`symbol: ${symbolDarkDims.width}/${symbolDarkDims.height} = ${(symbolDarkDims.width / symbolDarkDims.height).toFixed(3)}`);
  console.log(`wordmark: ${wordmarkDarkDims.width}/${wordmarkDarkDims.height} = ${(wordmarkDarkDims.width / wordmarkDarkDims.height).toFixed(3)}`);

  console.log("\n✅ Done! All brand images cropped to content.");
}

run().catch(console.error);
