import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeHero() {
  const inputPath = path.resolve('public/assets/images/chicken_mandi_hero_1789894879370.webp');
  const buffer = fs.readFileSync(inputPath);

  const metadata = await sharp(buffer).metadata();
  console.log('Original hero image:', metadata.width, 'x', metadata.height, 'Size:', buffer.length, 'bytes');

  // 1. Mobile 640w
  const buf640 = await sharp(buffer)
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();
  fs.writeFileSync('public/assets/images/chicken_mandi_hero_640w.webp', buf640);
  console.log('640w size:', buf640.length, 'bytes');

  // 2. Mobile max 1080w (primary first slide image)
  const buf1080 = await sharp(buffer)
    .resize({ width: 1080, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();
  fs.writeFileSync('public/assets/images/chicken_mandi_hero_1080w.webp', buf1080);
  console.log('1080w size:', buf1080.length, 'bytes');

  // 3. Desktop 1376w / 1400w
  const buf1400 = await sharp(buffer)
    .resize({ width: 1376, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toBuffer();
  fs.writeFileSync('public/assets/images/chicken_mandi_hero_1400w.webp', buf1400);
  console.log('1400w size:', buf1400.length, 'bytes');

  // Also optimize the original path so any direct link is also under 100 KB (1080w)
  fs.writeFileSync('public/assets/images/chicken_mandi_hero_1789894879370.webp', buf1080);
  console.log('Updated original path with optimized 1080w (size:', buf1080.length, 'bytes)');

  // Also optimize other slides to be under 100 KB
  const otherSlides = [
    'chicken_tikka_hero_1789894901572.webp',
    'sizzling_tandoori_hero_1789894957461.webp',
    'vibrant_mocktails_hero_1789894941398.webp',
    'brownie_dessert_hero_1789894922593.webp'
  ];

  for (const file of otherSlides) {
    const p = path.resolve('public/assets/images', file);
    if (fs.existsSync(p)) {
      const orig = fs.readFileSync(p);
      const opt = await sharp(orig)
        .resize({ width: 1080, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toBuffer();
      fs.writeFileSync(p, opt);
      console.log(`Optimized ${file}: ${orig.length} -> ${opt.length} bytes`);
    }
  }
}

optimizeHero().catch(console.error);
