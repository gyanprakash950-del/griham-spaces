#!/usr/bin/env node
/**
 * Simple static site builder for Griham Spaces
 * Compiles HTML templates with partials and data
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const PARTIALS_DIR = path.join(SRC_DIR, 'partials');
const PAGES_DIR = path.join(SRC_DIR, 'pages');
const DATA_DIR = path.join(SRC_DIR, 'data');
const DIST_DIR = path.join(__dirname, 'dist');
const ASSETS_DIR = path.join(SRC_DIR, 'assets');

// Simple template engine with {{variable}} and {{#if condition}}...{{/if}} and {{#each array}}...{{/each}}
function render(template, data) {
  let output = template;

  // Handle {{#each array}}...{{/each}}
  output = output.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, inner) => {
    const arr = data[key] || [];
    return arr.map(item => {
      let itemOutput = inner;
      // Replace {{prop}} in each item
      Object.keys(item).forEach(prop => {
        itemOutput = itemOutput.replace(new RegExp(`\\{\\{${prop}\\}\\}`, 'g'), item[prop]);
      });
      return itemOutput;
    }).join('');
  });

  // Handle {{#if condition}}...{{/if}}
  output = output.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, inner) => {
    return data[key] ? inner : '';
  });

  // Handle {{variable}}
  output = output.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });

  return output;
}

function readFile(filepath) {
  return fs.readFileSync(filepath, 'utf8');
}

function writeFile(filepath, content) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, content);
}

function copyAssets() {
  // Copy styles.css
  if (fs.existsSync(path.join(__dirname, 'styles.css'))) {
    fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(DIST_DIR, 'styles.css'));
  }
  // Copy script.js
  if (fs.existsSync(path.join(__dirname, 'script.js'))) {
    fs.copyFileSync(path.join(__dirname, 'script.js'), path.join(DIST_DIR, 'script.js'));
  }
  // Copy assets folder
  if (fs.existsSync(ASSETS_DIR)) {
    copyRecursive(ASSETS_DIR, path.join(DIST_DIR, 'assets'));
  }
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function build() {
  console.log('Building Griham Spaces website...');

  // Load partials
  const header = readFile(path.join(PARTIALS_DIR, 'header.html'));
  const footer = readFile(path.join(PARTIALS_DIR, 'footer.html'));

  // Load site data
  const siteData = JSON.parse(readFile(path.join(DATA_DIR, 'site.json')));
  const products = JSON.parse(readFile(path.join(DATA_DIR, 'products.json')));

  // Ensure dist directory exists
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Page configurations
  const pages = [
    {
      name: 'index',
      title: 'Griham Spaces | Luxury Within Reach',
      description: 'Griham Spaces - Luxury Within Reach. Premium furniture, decor & electronics at affordable prices in Bhagalpur, Bihar.',
      keywords: 'furniture, home decor, electronics, Bhagalpur, affordable luxury, Griham Spaces',
      activeHome: true,
      contentFile: path.join(PAGES_DIR, 'index.html'),
      footerNavTitle: 'Furniture',
      footerNavLabel: 'Furniture categories',
      footerNavItems: [
        { url: 'furniture.html#wardrobes', label: 'Wardrobes & Almirahs' },
        { url: 'furniture.html#beds', label: 'Beds' },
        { url: 'furniture.html#sofas', label: 'Sofas' },
        { url: 'furniture.html#dining', label: 'Dining Sets' },
        { url: 'furniture.html#tvtables', label: 'TV Units' }
      ]
    },
    {
      name: 'furniture',
      title: 'Furniture | Griham Spaces - Luxury Within Reach',
      description: 'Griham Spaces Furniture Collection - Wardrobes, beds, sofas, dining sets, TV units & more at affordable prices in Bhagalpur.',
      keywords: 'furniture, wardrobes, beds, sofas, dining tables, TV units, Bhagalpur, affordable furniture',
      activeFurniture: true,
      contentFile: path.join(PAGES_DIR, 'furniture.html'),
      footerNavTitle: 'Furniture',
      footerNavLabel: 'Furniture categories',
      footerNavItems: [
        { url: 'furniture.html#wardrobes', label: 'Wardrobes & Almirahs' },
        { url: 'furniture.html#beds', label: 'Beds' },
        { url: 'furniture.html#sofas', label: 'Sofas' },
        { url: 'furniture.html#dining', label: 'Dining Sets' },
        { url: 'furniture.html#tvtables', label: 'TV Units' }
      ]
    },
    {
      name: 'decor',
      title: 'Decor | Griham Spaces - Luxury Within Reach',
      description: 'Griham Spaces Decor Collection - Lamps, wall art, rugs, mirrors & home accents at affordable prices in Bhagalpur.',
      keywords: 'home decor, lamps, wall art, rugs, mirrors, home accents, Bhagalpur, affordable decor',
      activeDecor: true,
      contentFile: path.join(PAGES_DIR, 'decor.html'),
      footerNavTitle: 'Decor',
      footerNavLabel: 'Decor categories',
      footerNavItems: [
        { url: 'decor.html#lighting', label: 'Lighting' },
        { url: 'decor.html#wallart', label: 'Wall Art' },
        { url: 'decor.html#rugs', label: 'Rugs' },
        { url: 'decor.html#mirrors', label: 'Mirrors' },
        { url: 'decor.html#accents', label: 'Accents' }
      ]
    },
    {
      name: 'electronics',
      title: 'Electronics | Griham Spaces - Luxury Within Reach',
      description: 'Griham Spaces Electronics Collection - Smart TVs, appliances, audio systems & more at affordable prices in Bhagalpur.',
      keywords: 'electronics, smart TV, appliances, audio, home appliances, Bhagalpur, affordable electronics',
      activeElectronics: true,
      contentFile: path.join(PAGES_DIR, 'electronics.html'),
      footerNavTitle: 'Electronics',
      footerNavLabel: 'Electronics categories',
      footerNavItems: [
        { url: 'electronics.html#tv', label: 'Smart TVs' },
        { url: 'electronics.html#appliances', label: 'Home Appliances' },
        { url: 'electronics.html#audio', label: 'Audio Systems' },
        { url: 'electronics.html#other', label: 'Other Electronics' }
      ]
    },
    {
      name: 'contact',
      title: 'Contact | Griham Spaces - Luxury Within Reach',
      description: 'Visit Griham Spaces in Bhagalpur for furniture, home decor and electronics. Call or message our team.',
      keywords: 'contact, furniture store, home decor, electronics, Bhagalpur, Bihar',
      activeContact: true,
      contentFile: path.join(PAGES_DIR, 'contact.html'),
      footerNavTitle: 'Furniture',
      footerNavLabel: 'Furniture categories',
      footerNavItems: [
        { url: 'furniture.html#wardrobes', label: 'Wardrobes & Almirahs' },
        { url: 'furniture.html#beds', label: 'Beds' },
        { url: 'furniture.html#sofas', label: 'Sofas' },
        { url: 'furniture.html#dining', label: 'Dining Sets' },
        { url: 'furniture.html#tvtables', label: 'TV Units' }
      ]
    }
  ];

  // Current year for copyright
  const year = new Date().getFullYear();

  // Build each page
  for (const page of pages) {
    const content = readFile(page.contentFile);
    const renderedHeader = render(header, { ...page, year });
    const renderedFooter = render(footer, { ...page, year });

    // Inject header and footer into content
    let html = content
      .replace('{{> header}}', renderedHeader)
      .replace('{{> footer}}', renderedFooter)
      .replace('{{title}}', page.title)
      .replace('{{description}}', page.description)
      .replace('{{keywords}}', page.keywords)
      .replace('{{year}}', year);

    writeFile(path.join(DIST_DIR, `${page.name}.html`), html);
    console.log(`  Built: ${page.name}.html`);
  }

  // Copy assets
  copyAssets();
  console.log('  Copied assets');

  console.log('Build complete!');
}

// Run build
build();