const fs = require('fs');

const html = fs.readFileSync('dist/index.html', 'utf8');

function cleanHTML(html) {
  const rootMarker = '<div id="root" data-server-rendered="true">';
  const rootIdx = html.indexOf(rootMarker);
  if (rootIdx === -1) return html;

  const afterRoot = html.slice(rootIdx + rootMarker.length);
  // Find where the real app container starts: <div class="min-h-screen" or <div id="not-found-container"
  const appStartMatch = afterRoot.match(/<div (?:class="min-h-screen"|id="not-found-container")/);
  if (!appStartMatch) return html;

  const appStartIdx = appStartMatch.index;
  const trappedHeader = afterRoot.slice(0, appStartIdx);
  const restOfApp = afterRoot.slice(appStartIdx);

  console.log('Trapped header content in #root (length:', trappedHeader.length, '):');
  console.log(trappedHeader);

  // Remove default title/meta from <head> to avoid duplicates
  let headPart = html.slice(0, rootIdx);
  // Remove existing <title>...</title> in headPart
  headPart = headPart.replace(/<title>[\s\S]*?<\/title>/i, '');
  // Remove existing canonical
  headPart = headPart.replace(/<link rel="canonical"[^>]*>/i, '');
  // Remove default description
  headPart = headPart.replace(/<meta name="description"[^>]*>/i, '');
  headPart = headPart.replace(/<meta name="title"[^>]*>/i, '');

  const headEndIdx = headPart.indexOf('</head>');
  if (headEndIdx !== -1) {
    headPart = headPart.slice(0, headEndIdx) + '\n    ' + trappedHeader + '\n  ' + headPart.slice(headEndIdx);
  }

  const cleanedHtml = headPart + rootMarker + restOfApp;
  return cleanedHtml;
}

const cleaned = cleanHTML(html);
fs.writeFileSync('dist/index.html', cleaned, 'utf8');
console.log('Successfully cleaned dist/index.html!');
