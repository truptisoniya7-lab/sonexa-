const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputFile = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\1edeb36d-4e11-417c-a83b-28a8af129fe1\\sonexa_logo_waveform_s_1785413163026.jpg';
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
    for (const s of sizes) {
      await sharp(inputFile)
        .resize(s.size, s.size)
        .toFile(path.join(outputDir, s.name));
      console.log(`Generated ${s.name}`);
    }
    
    // Also generate a generic favicon.ico which is standard
    // (though modern browsers prefer PNG)
    await sharp(inputFile)
        .resize(32, 32)
        .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('Generated favicon.ico');

  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
