/**
 * Font Download via Google Fonts API
 * Fetches CSS from Google Fonts API and extracts actual font URLs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.join(PROJECT_ROOT, 'public', 'fonts');

if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    }).on('error', (err) => {
      fs.unlink(filepath, () => reject(err));
    });
  });
}

async function downloadFontsViaAPI() {
  // Fetch CSS from Google Fonts API with specific weights
  const fonts = [
    { family: 'Playfair+Display', weights: '400,500,600,700' },
    { family: 'Inter', weights: '300,400,500,600' }
  ];

  const cssPromises = fonts.map(f =>
    fetch(`https://fonts.googleapis.com/css2?family=${f.family}:wght@${f.weights}&display=swap`)
  );

  const cssResults = await Promise.all(cssPromises);
  const allCSS = cssResults.join('\n');

  // Extract font URLs from CSS
  // Pattern: src: url(https://fonts.gstatic.com/...) format('woff2');
  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
  const urls = [...allCSS.matchAll(urlRegex)].map(m => m[1]);

  console.log(`Found ${urls.length} font URLs\n`);

  for (const url of urls) {
    // Extract filename from URL
    const fileName = url.split('/').pop().split('?')[0];
    const filePath = path.join(FONTS_DIR, fileName);

    if (fs.existsSync(filePath)) {
      console.log(`  ⊙ Exists: ${fileName}`);
      continue;
    }

    try {
      console.log(`  Downloading: ${fileName}`);
      await downloadFile(url, filePath);
      console.log(`  ✓ ${fileName}`);
    } catch (e) {
      console.error(`  ✗ Failed: ${fileName} - ${e.message}`);
    }
  }

  console.log('\n✓ Font download complete!');
}

downloadFontsViaAPI().catch(console.error);