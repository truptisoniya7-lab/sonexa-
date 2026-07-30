const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputFile = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\1edeb36d-4e11-417c-a83b-28a8af129fe1\\sonexa_favicon_bold_s_1785413500818.jpg';
const outputDir = path.join(__dirname, 'public');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 }
];

async function generateIcons() {
  try {
    // Generate rounded corner favicons
    for (const s of sizes) {
      const roundedCorners = Buffer.from(
        `<svg><rect x="0" y="0" width="${s.size}" height="${s.size}" rx="${s.size * 0.2}" ry="${s.size * 0.2}"/></svg>`
      );

      await sharp(inputFile)
        .resize(s.size, s.size)
        .composite([{ input: roundedCorners, blend: 'dest-in' }])
        .png()
        .toFile(path.join(outputDir, s.name));
      console.log(`Generated rounded ${s.name}`);
    }
    
    // Generate Maskable Icon (Full square, no rounded corners)
    await sharp(inputFile)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-maskable.png'));
    console.log('Generated icon-maskable.png');

    // Generate Apple Touch Icon (Full square, Apple rounds it automatically)
    await sharp(inputFile)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png');

    // Generate Safari Pinned Tab (Usually a monochrome SVG, but we'll supply a placeholder if needed, Next.js supports just linking it)
    
    // Generate a generic favicon.ico which is standard
    await sharp(inputFile)
        .resize(32, 32)
        .composite([{ input: Buffer.from(`<svg><rect x="0" y="0" width="32" height="32" rx="6.4" ry="6.4"/></svg>`), blend: 'dest-in' }])
        .png()
        .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('Generated favicon.ico');

  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
