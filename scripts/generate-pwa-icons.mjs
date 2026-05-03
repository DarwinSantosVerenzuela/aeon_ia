/**
 * Genera todos los iconos PWA a partir de "icono pwa.jpg"
 * Redimensiona a todos los tamaños requeridos por el manifest.
 */
import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(__dirname, "..", "public", "icons", "icono pwa.jpg");
const OUT_DIR = join(__dirname, "..", "public", "icons");

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function main() {
  for (const size of SIZES) {
    const out = join(OUT_DIR, `icon-${size}x${size}.png`);
    await sharp(SOURCE)
      .resize(size, size, { fit: "cover" })
      .png({ quality: 100 })
      .toFile(out);
    console.log(`✓ ${size}x${size}`);
  }

  // apple-touch-icon (180x180)
  const appleTouchOut = join(__dirname, "..", "public", "apple-touch-icon.png");
  await sharp(SOURCE)
    .resize(180, 180, { fit: "cover" })
    .png({ quality: 100 })
    .toFile(appleTouchOut);
  console.log("✓ apple-touch-icon 180x180");

  // favicon 32x32
  const fav32 = join(__dirname, "..", "public", "favicon-32x32.png");
  await sharp(SOURCE)
    .resize(32, 32, { fit: "cover" })
    .png({ quality: 100 })
    .toFile(fav32);
  console.log("✓ favicon 32x32");

  // favicon 16x16
  const fav16 = join(__dirname, "..", "public", "favicon-16x16.png");
  await sharp(SOURCE)
    .resize(16, 16, { fit: "cover" })
    .png({ quality: 100 })
    .toFile(fav16);
  console.log("✓ favicon 16x16");

  // favicon.png general
  const favGen = join(__dirname, "..", "public", "favicon.png");
  await sharp(SOURCE)
    .resize(48, 48, { fit: "cover" })
    .png({ quality: 100 })
    .toFile(favGen);
  console.log("✓ favicon.png 48x48");

  console.log("\n🎯 Todos los iconos PWA generados correctamente.");
}

main().catch(console.error);
