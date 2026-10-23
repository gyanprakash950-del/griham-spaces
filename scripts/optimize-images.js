/**
 * Image Optimization Script
 * Downloads Unsplash images, converts to WebP/AVIF, creates srcset
 * Run with: node scripts/optimize-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'products');
const PRODUCTS_JSON = path.join(PROJECT_ROOT, 'src', 'data', 'products.json');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Check if sharp is available (for image conversion)
let sharp;
try {
  sharp = await import('sharp');
} catch (e) {
  console.log('sharp not installed. Install with: npm install sharp');
  console.log('Skipping image conversion, only downloading originals...');
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(filepath, () => reject(err));
    });
  });
}

async function convertImage(inputPath, outputPath, format, options = {}) {
  if (!sharp) return false;

  try {
    await sharp.default(inputPath)
      [format](options)
      .toFile(outputPath);
    return true;
  } catch (e) {
    console.error(`Conversion failed for ${inputPath}:`, e.message);
    return false;
  }
}

async function optimizeImages() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf-8')).products;

  console.log(`Processing ${products.length} products...\n`);

  for (const product of products) {
    const ext = path.extname(new URL(product.image).pathname) || '.jpg';
    const baseName = product.id;
    const originalPath = path.join(IMAGES_DIR, `${baseName}${ext}`);
    const webpPath = path.join(IMAGES_DIR, `${baseName}.webp`);
    const avifPath = path.join(IMAGES_DIR, `${baseName}.avif`);

    // Download original if not exists
    if (!fs.existsSync(originalPath)) {
      console.log(`Downloading: ${product.name}`);
      try {
        await downloadImage(product.image, originalPath);
        console.log(`  ✓ Saved: ${baseName}${ext}`);
      } catch (e) {
        console.error(`  ✗ Failed: ${e.message}`);
        continue;
      }
    } else {
      console.log(`  ⊙ Exists: ${baseName}${ext}`);
    }

    // Convert to WebP
    if (sharp && !fs.existsSync(webpPath)) {
      console.log(`  Converting to WebP...`);
      await convertImage(originalPath, webpPath, 'webp', { quality: 80 });
      console.log(`  ✓ WebP: ${baseName}.webp`);
    }

    // Convert to AVIF
    if (sharp && !fs.existsSync(avifPath)) {
      console.log(`  Converting to AVIF...`);
      await convertImage(originalPath, avifPath, 'avif', { quality: 70 });
      console.log(`  ✓ AVIF: ${baseName}.avif`);
    }
  }

  console.log('\n✓ Image optimization complete!');
  console.log(`Images saved to: ${IMAGES_DIR}`);

  // Generate srcset helper data
  generateSrcsetData(products);
}

function generateSrcsetData(products) {
  const srcsetData = {};

  for (const product of products) {
    const baseName = product.id;
    srcsetData[baseName] = {
      original: `/images/products/${baseName}${path.extname(new URL(product.image).pathname) || '.jpg'}`,
      webp: `/images/products/${baseName}.webp`,
      avif: `/images/products/${baseName}.avif`,
      alt: product.name
    };
  }

  const outputPath = path.join(PROJECT_ROOT, 'src', 'data', 'image-srcset.json');
  fs.writeFileSync(outputPath, JSON.stringify(srcsetData, null, 2));
  console.log(`\nSrcset data saved to: ${outputPath}`);
}

// Run
optimizeImages().catch(console.error);