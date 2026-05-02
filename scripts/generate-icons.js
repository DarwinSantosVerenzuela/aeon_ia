const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// SVG del símbolo oficial de Aeon — asterisco de 8 rayos + punto 'i'
// Fondo claro para favicon de pestaña
const svgIcon = [
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>",
  "  <rect width='512' height='512' rx='80' fill='#ffffff'/>",
  "  <rect x='232' y='62' width='48' height='30' rx='14' fill='#3d3d3d'/>",
  "  <rect x='232' y='106' width='48' height='300' rx='20' fill='#3d3d3d'/>",
  "  <rect x='106' y='232' width='300' height='48' rx='20' fill='#3d3d3d'/>",
  "  <g transform='rotate(45 256 256)'>",
  "    <rect x='232' y='106' width='48' height='300' rx='20' fill='#3d3d3d'/>",
  "  </g>",
  "  <g transform='rotate(-45 256 256)'>",
  "    <rect x='232' y='106' width='48' height='300' rx='20' fill='#3d3d3d'/>",
  "  </g>",
  "</svg>"
].join('\n');

// SVG para PWA (fondo oscuro, símbolo claro)
const svgPWA = [
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>",
  "  <rect width='512' height='512' fill='#1a1a1a'/>",
  "  <rect x='232' y='62' width='48' height='30' rx='14' fill='#f0f0f0'/>",
  "  <rect x='232' y='106' width='48' height='300' rx='20' fill='#f0f0f0'/>",
  "  <rect x='106' y='232' width='300' height='48' rx='20' fill='#f0f0f0'/>",
  "  <g transform='rotate(45 256 256)'>",
  "    <rect x='232' y='106' width='48' height='300' rx='20' fill='#f0f0f0'/>",
  "  </g>",
  "  <g transform='rotate(-45 256 256)'>",
  "    <rect x='232' y='106' width='48' height='300' rx='20' fill='#f0f0f0'/>",
  "  </g>",
  "</svg>"
].join('\n');

const outDir = 'public/icons';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const svgBuf = Buffer.from(svgIcon);
const svgPWABuf = Buffer.from(svgPWA);
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Favicon de pestaña (oscuro sobre blanco) 
sharp(svgBuf).resize(32, 32).png().toFile('public/favicon-32x32.png')
  .then(() => console.log('favicon-32x32.png created'));

sharp(svgBuf).resize(180, 180).png().toFile('public/apple-touch-icon.png')
  .then(() => console.log('apple-touch-icon.png created'));

// Iconos PWA (claro sobre oscuro)
Promise.all(
  sizes.map(size =>
    sharp(svgPWABuf)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, 'icon-' + size + 'x' + size + '.png'))
      .then(() => console.log('icon-' + size + 'x' + size + '.png OK'))
  )
).then(() => console.log('All done!')).catch(e => console.error('Error:', e));
