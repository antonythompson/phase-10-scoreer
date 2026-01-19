const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');
const indexPath = path.join(distDir, 'index.html');

// Copy public folder contents to dist
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  files.forEach(file => {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${file}`);
  });
}

// Read and modify index.html
let html = fs.readFileSync(indexPath, 'utf8');

// Fix module script tag
html = html.replace('<script src=', '<script type="module" src=');

// PWA meta tags to inject
const pwaTags = `
    <!-- PWA Support -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#1a1a2e">

    <!-- iOS PWA Support -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Phase 10">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <!-- Prevent zoom on input focus (iOS) -->
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
`;

// Inject PWA tags before </head>
html = html.replace('</head>', pwaTags + '  </head>');

// Also update the existing viewport meta tag
html = html.replace(
  '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />',
  ''
);

fs.writeFileSync(indexPath, html);
console.log('PWA support added to index.html');
