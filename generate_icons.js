import { Jimp, rgbaToInt } from 'jimp';
import fs from 'fs';
import path from 'path';

async function generateFavicons() {
  console.log('Generating favicon suite...');
  
  // Base colors
  // Deep Emerald: #0D2E2E (13, 46, 46, 255) => rgbaToInt(13, 46, 46, 255)
  // Gold Accent: #D4AF37 (212, 175, 55, 255) => rgbaToInt(212, 175, 55, 255)
  // Sage Green: #355C5D (53, 92, 93, 255) => rgbaToInt(53, 92, 93, 255)
  
  const bgRed = 13, bgGreen = 46, bgBlue = 46;
  const goldRed = 212, goldGreen = 175, goldBlue = 55;
  const sageRed = 53, sageGreen = 92, sageBlue = 93;

  const size = 512;
  
  // Create solid deep emerald canvas
  const image = new Jimp({ width: size, height: size, color: rgbaToInt(bgRed, bgGreen, bgBlue, 255) });
  
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.35; // Ring radius
  
  // Draw beautiful symmetrical therapeutic sprout mandala
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Draw outer circular leaf border
      if (dist > maxRadius - 12 && dist < maxRadius + 12) {
        // Thick smooth ring
        const t = Math.abs(dist - maxRadius) / 12; // 0 at center, 1 at edge
        const opacity = Math.max(0, 1 - t);
        
        // Let's interpolate color between background and gold
        const r = Math.round(bgRed * (1 - opacity) + goldRed * opacity);
        const g = Math.round(bgGreen * (1 - opacity) + goldGreen * opacity);
        const b = Math.round(bgBlue * (1 - opacity) + goldBlue * opacity);
        
        const currentColor = rgbaToInt(r, g, b, 255);
        image.setPixelColor(currentColor, x, y);
      }
      
      // Draw central sprout/leaf shape
      if (dy >= -150 && dy <= 120) {
        // Normalized vertical coordinate from 0 (top) to 1 (bottom)
        const v = (dy + 150) / 270; 
        // Leaf width at this height
        const leafWidth = 90 * Math.sin(v * Math.PI) * (1.2 - v);
        
        if (Math.abs(dx) < leafWidth) {
          // Inside the leaf! Let's fill with Sage Green
          const distToEdge = leafWidth - Math.abs(dx);
          const edgeWidth = 8;
          let r = sageRed;
          let g = sageGreen;
          let b = sageBlue;
          
          if (distToEdge < edgeWidth) {
            // Gold border for the leaf
            const opacity = distToEdge / edgeWidth;
            r = Math.round(goldRed * (1 - opacity) + sageRed * opacity);
            g = Math.round(goldGreen * (1 - opacity) + sageGreen * opacity);
            b = Math.round(goldBlue * (1 - opacity) + sageBlue * opacity);
          }
          
          // Add a central vein
          if (Math.abs(dx) < 3) {
            r = goldRed;
            g = goldGreen;
            b = goldBlue;
          }
          
          const currentColor = rgbaToInt(r, g, b, 255);
          image.setPixelColor(currentColor, x, y);
        }
      }
    }
  }

  // Create different sizes
  const sizes = [16, 32, 192, 512];
  const publicDir = path.join(process.cwd(), 'public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (const s of sizes) {
    const resized = image.clone().resize({ w: s, h: s });
    const fileName = s === 512 ? 'android-chrome-512x512.png' : s === 192 ? 'android-chrome-192x192.png' : `favicon-${s}x16.png`;
    // Fix filename typo for standard sizes
    const actualName = s === 16 ? 'favicon-16x16.png' : s === 32 ? 'favicon-32x32.png' : fileName;
    
    const outPath = path.join(publicDir, actualName);
    await resized.write(outPath);
    console.log(`Saved ${actualName} (${s}x${s})`);
  }

  // Also save standard favicon.png
  await image.clone().resize({ w: 32, h: 32 }).write(path.join(publicDir, 'favicon.png'));
  console.log('Saved favicon.png (32x32)');

  // Also save favicon.ico (using getBuffer and writing directly as a PNG payload with .ico name)
  const icoResized = image.clone().resize({ w: 32, h: 32 });
  const pngBuffer = await icoResized.getBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), pngBuffer);
  console.log('Saved favicon.ico (32x32)');
  
  console.log('Favicon suite generated successfully!');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
