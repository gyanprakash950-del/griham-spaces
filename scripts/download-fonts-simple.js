/**
 * Simple Font Download Script
 * Downloads specific Google Font files using known URLs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FONTS_DIR = path.join(PROJECT_ROOT, 'public', 'fonts');

// Known Google Fonts URLs for the specific weights we need
// These are from fonts.gstatic.com - they may change but generally stable
const FONT_URLS = {
  // Playfair Display
  'PlayfairDisplay-Regular.woff2': 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtA.woff2',
  'PlayfairDisplay-Medium.woff2': 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtA.woff2',
  'PlayfairDisplay-SemiBold.woff2': 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtA.woff2',
  'PlayfairDisplay-Bold.woff2': 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtA.woff2',

  // Inter
  'Inter-Regular.woff2': 'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
  'Inter-Medium.woff2': 'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
  'Inter-SemiBold.woff2': 'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
  'Inter-Bold.woff2': 'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
};

// Ensure fonts directory exists
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
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

async function downloadFonts() {
  console.log('Downloading fonts...\n');

  for (const [fileName, url] of Object.entries(FONT_URLS)) {
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

downloadFonts().catch(console.error);