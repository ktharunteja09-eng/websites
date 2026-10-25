const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const specIdx = html.indexOf('id="specialties"');
const imgIdx = html.indexOf('src="/assets/vaibhav-grand-webp-images/food14.webp"', specIdx);
console.log(html.slice(imgIdx - 5, imgIdx + 300));
