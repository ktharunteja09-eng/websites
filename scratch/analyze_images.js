import fs from 'fs';
import path from 'path';

const restaurantData = fs.readFileSync('src/data/restaurantData.ts', 'utf8');
const photoMenuData = fs.readFileSync('src/data/photoMenuData.ts', 'utf8');

const regex = /['"](\/assets\/[^'"]+\.(?:webp|jpg|jpeg|png))['"]/g;
const imageSet = new Set();
let m;
while ((m = regex.exec(restaurantData)) !== null) imageSet.add(m[1]);
while ((m = regex.exec(photoMenuData)) !== null) imageSet.add(m[1]);

console.log('Total unique images referenced:', imageSet.size);

const imageList = Array.from(imageSet);
const stats = imageList.map(img => {
  const p = path.join('public', img.replace(/^\//, ''));
  if (fs.existsSync(p)) {
    const s = fs.statSync(p);
    return { path: img, fullPath: p, sizeKB: s.size / 1024 };
  }
  return { path: img, missing: true };
});

const over50 = stats.filter(s => s.sizeKB && s.sizeKB > 50);
console.log('Images over 50KB count:', over50.length);
over50.sort((a, b) => b.sizeKB - a.sizeKB).forEach(s => {
  console.log(s.path, s.sizeKB.toFixed(1) + ' KB');
});
