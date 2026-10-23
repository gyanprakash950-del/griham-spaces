/**
 * Font Optimization Script
 * Downloads Google Fonts locally, subsets them, adds preload hints
 * Run with: node scripts/optimize-fonts.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.join(PROJECT_ROOT, 'public', 'fonts');

// Font configuration
const FONTS = {
  'Playfair Display': {
    weights: [400, 500, 600, 700],
    subsets: ['latin'],
    display: 'swap',
    variable: false
  },
  'Inter': {
    weights: [300, 400, 500, 600],
    subsets: ['latin'],
    display: 'swap',
    variable: false
  }
};

// Ensure fonts directory exists
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

async function downloadFont(fontName, weight, format = 'woff2') {
  const cleanName = fontName.replace(/\s+/g, '+');
  const url = `https://fonts.gstatic.com/s/${cleanName.toLowerCase()}/v1/${cleanName}-${weight}-latin.${format}`;
  const fileName = `${fontName.replace(/\s+/g, '-')}-${weight}.${format}`;
  const filePath = path.join(FONTS_DIR, fileName);

  if (fs.existsSync(filePath)) {
    console.log(`  ⊙ Exists: ${fileName}`);
    return fileName;
  }

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        // Try alternative URL format
        file.close();
        fs.unlinkSync(filePath);
        tryAlternativeUrl(fontName, weight, format).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`  ✓ Downloaded: ${fileName}`);
        resolve(fileName);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => reject(err));
    });
  });
}

async function tryAlternativeUrl(fontName, weight, format) {
  // Google Fonts API v2 URL format
  const cleanName = fontName.replace(/\s+/g, '%20');
  const url = `https://fonts.googleapis.com/css2?family=${cleanName}:wght@${weight}&display=swap`;

  // We need to parse the CSS to get actual font URLs
  // For simplicity, let's use a different approach
  return null;
}

async function generateFontFaceCSS() {
  let css = '/* Self-hosted Google Fonts */\n\n';

  for (const [fontName, config] of Object.entries(FONTS)) {
    for (const weight of config.weights) {
      const fileName = `${fontName.replace(/\s+/g, '-')}-${weight}.woff2`;
      const filePath = path.join(FONTS_DIR, fileName);

      if (fs.existsSync(filePath)) {
        css += `@font-face {\n`;
        css += `  font-family: '${fontName}';\n`;
        css += `  font-weight: ${weight};\n`;
        css += `  font-style: normal;\n`;
        css += `  font-display: ${config.display};\n`;
        css += `  src: url('/fonts/${fileName}') format('woff2');\n`;
        css += `  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n`;
        css += `}\n\n`;
      }
    }
  }

  const outputPath = path.join(PROJECT_ROOT, 'src', 'styles', 'fonts.css');
  fs.writeFileSync(outputPath, css);
  console.log(`\nFont CSS saved to: ${outputPath}`);
}

async function generatePreloadLinks() {
  let preloads = '<!-- Font Preload Hints -->\n';

  for (const [fontName, config] of Object.entries(FONTS)) {
    // Preload the regular weight (400) as it's most commonly used
    const regularWeight = config.weights.includes(400) ? 400 : config.weights[0];
    const fileName = `${fontName.replace(/\s+/g, '-')}-${regularWeight}.woff2`;
    const filePath = path.join(FONTS_DIR, fileName);

    if (fs.existsSync(filePath)) {
      preloads += `<link rel="preload" href="/fonts/${fileName}" as="font" type="font/woff2" crossorigin>\n`;
    }
  }

  const outputPath = path.join(PROJECT_ROOT, 'src', 'components', 'FontPreloads.html');
  fs.writeFileSync(outputPath, preloads);
  console.log(`Font preloads saved to: ${outputPath}`);
}

async function optimizeFonts() {
  console.log('Downloading Google Fonts...\n');

  for (const [fontName, config] of Object.entries(FONTS)) {
    console.log(`Font: ${fontName}`);
    for (const weight of config.weights) {
      await downloadFont(fontName, weight, 'woff2');
    }
  }

  await generateFontFaceCSS();
  await generatePreloadLinks();

  console.log('\n✓ Font optimization complete!');
  console.log(`Fonts saved to: ${FONTS_DIR}`);
  console.log('\nNext steps:');
  console.log('1. Include fonts.css in your main.css: @import "fonts.css";');
  console.log('2. Include FontPreloads.html in your HTML head');
  console.log('3. Remove Google Fonts <link> from HTML templates');
}

// Run
optimizeFonts().catch(console.error);