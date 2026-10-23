/**
 * Font Download via Google Fonts API with proper headers for WOFF2
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

function fetchCSS() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'fonts.googleapis.com',
      path: '/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/css,*/*;q=0.1'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    https.get(url, options, (response) => {
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

async function downloadFonts() {
  console.log('Fetching CSS from Google Fonts API...\n');

  const css = await fetchCSS();

  // Save CSS for debugging
  fs.writeFileSync(path.join(FONTS_DIR, 'debug-fonts.css'), css);

  // Extract font URLs - both woff2 and ttf
  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.(?:woff2|ttf))\)/g;
  const urls = [...css.matchAll(urlRegex)].map(m => m[1]);

  // Deduplicate
  const uniqueUrls = [...new Set(urls)];

  console.log(`Found ${uniqueUrls.length} unique font URLs\n`);

  for (const url of uniqueUrls) {
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

  // Generate fonts.css with @font-face declarations
  await generateFontFaceCSS();
  await generatePreloadLinks();

  console.log('\n✓ Font download complete!');
}

async function generateFontFaceCSS() {
  let css = '/* Self-hosted Google Fonts */\n\n';

  const files = fs.readdirSync(FONTS_DIR).filter(f => f.endsWith('.woff2') || f.endsWith('.ttf'));

  for (const file of files) {
    const ext = path.extname(file).slice(1);
    const format = ext === 'woff2' ? 'woff2' : 'truetype';
    const nameParts = file.replace(`.${ext}`, '').split('-');
    const weight = nameParts.pop();
    const fontFamily = nameParts.join(' ').replace(/([A-Z])/g, ' $1').trim();

    css += `@font-face {\n`;
    css += `  font-family: '${fontFamily}';\n`;
    css += `  font-weight: ${weight};\n`;
    css += `  font-style: normal;\n`;
    css += `  font-display: swap;\n`;
    css += `  src: url('/fonts/${file}') format('${format}');\n`;
    css += `  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n`;
    css += `}\n\n`;
  }

  const outputPath = path.join(PROJECT_ROOT, 'src', 'styles', 'fonts.css');
  fs.writeFileSync(outputPath, css);
  console.log(`\nFont CSS saved to: ${outputPath}`);
}

async function generatePreloadLinks() {
  let preloads = '<!-- Font Preload Hints -->\n';

  const files = fs.readdirSync(FONTS_DIR).filter(f => f.endsWith('.woff2') || f.endsWith('.ttf'));

  // Preload regular weights
  const regularFiles = files.filter(f => f.includes('-400.') || f.includes('-Regular.'));

  for (const file of regularFiles) {
    const ext = path.extname(file).slice(1);
    const format = ext === 'woff2' ? 'woff2' : 'truetype';
    preloads += `<link rel="preload" href="/fonts/${file}" as="font" type="font/${format}" crossorigin>\n`;
  }

  const outputPath = path.join(PROJECT_ROOT, 'src', 'components', 'FontPreloads.html');
  fs.writeFileSync(outputPath, preloads);
  console.log(`Font preloads saved to: ${outputPath}`);
}

downloadFonts().catch(console.error);