import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, 'public', 'icon.svg');
const publicDir = path.join(__dirname, 'public');

const sizes = [192, 512];

async function generate() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  // Create Apple Touch Icon (180x180 is standard, but 192 works or 512. Let's make 180 as well)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
  console.log('Generated apple-touch-icon.png');

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `pwa-${size}x${size}.png`));
      
    console.log(`Generated pwa-${size}x${size}.png`);
  }
}

generate().catch(console.error);
