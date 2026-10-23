import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { globSync } from 'glob';
import { resolve, dirname, sep } from 'path';
import fs from 'fs';
import { render } from 'ejs';

// Site URL for SEO (update for production)
const SITE_URL = 'https://grihamspaces.com';

// Load data files
const siteData = JSON.parse(fs.readFileSync(resolve(__dirname, 'src/data/site.json'), 'utf-8'));
const categoriesData = JSON.parse(fs.readFileSync(resolve(__dirname, 'src/data/categories.json'), 'utf-8'));
const productsData = JSON.parse(fs.readFileSync(resolve(__dirname, 'src/data/products.json'), 'utf-8'));

// Get all HTML template files - normalize path separators for cross-platform compatibility
const htmlFiles = globSync('src/pages/*.html').map(f => f.replace(new RegExp('\\' + sep, 'g'), '/'));
const templateCache = new Map();

for (const file of htmlFiles) {
  const name = file.replace('src/pages/', '').replace('.html', '');
  const templatePath = resolve(__dirname, file);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  templateCache.set(name, {
    path: templatePath,
    content: templateContent,
    dirname: dirname(templatePath),
  });
}

// Entry points: minimal JS files that import CSS (one per page)
const jsEntries = {};
for (const name of templateCache.keys()) {
  jsEntries[name] = resolve(__dirname, `src/scripts/entries/${name}.js`);
}

// Helper to get page-specific data
function getPageData(pageName) {
  const currentYear = new Date().getFullYear();
  const baseData = {
    title: 'Griham Spaces | Luxury Within Reach',
    siteName: siteData.siteName,
    tagline: siteData.tagline,
    phone: siteData.phone,
    email: siteData.email,
    address: siteData.address,
    whatsappUrl: siteData.whatsappUrl,
    instagramUrl: siteData.instagramUrl,
    mapsUrl: siteData.mapsUrl,
    year: currentYear,
  };

  // Page-specific footer navigation
  const pageFooterData = {
    index: {
      footerNavTitle: 'Categories',
      footerNavItems: [
        { url: 'furniture.html', label: 'Furniture' },
        { url: 'decor.html', label: 'Home Decor' },
        { url: 'electronics.html', label: 'Electronics' },
      ],
    },
    furniture: {
      footerNavTitle: 'Furniture',
      footerNavItems: categoriesData.furniture.filters
        .filter(f => f.id !== 'all')
        .map(f => ({ url: `furniture.html?category=${f.id}`, label: f.label })),
    },
    decor: {
      footerNavTitle: 'Home Decor',
      footerNavItems: categoriesData.decor.filters
        .filter(f => f.id !== 'all')
        .map(f => ({ url: `decor.html?category=${f.id}`, label: f.label })),
    },
    electronics: {
      footerNavTitle: 'Electronics',
      footerNavItems: categoriesData.electronics.filters
        .filter(f => f.id !== 'all')
        .map(f => ({ url: `electronics.html?category=${f.id}`, label: f.label })),
    },
    contact: {
      footerNavTitle: 'Get in Touch',
      footerNavItems: [
        { url: 'tel:+918969343308', label: 'Call Us' },
        { url: 'https://wa.me/918969343308', label: 'WhatsApp' },
        { url: 'mailto:grihamspacesofficial@gmail.com', label: 'Email' },
        { url: siteData.mapsUrl, label: 'Directions' },
      ],
    },
  };

  // Breadcrumb data for JSON-LD
  const breadcrumbData = {
    index: [],
    furniture: [{ name: 'Furniture', url: 'furniture.html' }],
    decor: [{ name: 'Home Decor', url: 'decor.html' }],
    electronics: [{ name: 'Electronics', url: 'electronics.html' }],
    contact: [{ name: 'Contact', url: 'contact.html' }],
  };

  // Product list data for JSON-LD (category pages)
  const productListData = {
    furniture: productsData.products.filter(p => p.section === 'furniture'),
    decor: productsData.products.filter(p => p.section === 'decor'),
    electronics: productsData.products.filter(p => p.section === 'electronics'),
  };

  return {
    ...baseData,
    ...pageFooterData[pageName] || pageFooterData.index,
    breadcrumbData: breadcrumbData[pageName] || [],
    productListData: productListData[pageName] || [],
  };
}

// Custom plugin to generate HTML from EJS templates during build
function htmlGeneratorPlugin() {
  return {
    name: 'html-generator',
    // Generate HTML files at the end of build (closeBundle)
    closeBundle() {
      const outDir = resolve(__dirname, 'dist');

      // Ensure dist directory exists
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      for (const [name, template] of templateCache) {
        try {
          const data = getPageData(name);
          const rendered = render(template.content, data, {
            filename: template.path,
            views: [resolve(__dirname, 'src')],
          });

          // Add module script reference
          const finalHtml = rendered.replace('</body>', `<script type="module" src="/scripts/${name}.js"></script>\n</body>`);

          // Write to dist
          const outputPath = resolve(outDir, `${name}.html`);
          fs.writeFileSync(outputPath, finalHtml);
          console.log(`Generated: ${name}.html`);
        } catch (e) {
          console.error(`EJS render error for ${name}:`, e);
        }
      }
    },
    // Also generate during dev (for initial load)
    configureServer(server) {
      return () => {
        // Add middleware at the BEGINNING of the stack to run before Vite's HTML handling
        server.middlewares.stack.unshift({
          route: '',
          handle: async (req, res, next) => {
            // Parse URL to get clean pathname
            const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
            const pathname = url.pathname;

            if (pathname === '/' || pathname.endsWith('.html')) {
              const pageName = pathname === '/' ? 'index' : pathname.replace('.html', '').replace('/', '');
              const template = templateCache.get(pageName);

              if (template) {
                try {
                  const data = getPageData(pageName);
                  const rendered = render(template.content, data, {
                    filename: template.path,
                    views: [resolve(__dirname, 'src')],
                  });
                  const finalHtml = rendered.replace('</body>', `<script type="module" src="/scripts/${pageName}.js"></script>\n</body>`);
                  res.setHeader('Content-Type', 'text/html');
                  return res.end(finalHtml);
                } catch (e) {
                  console.error(`Dev EJS error for ${pageName}:`, e);
                }
              }
            }
            next();
          },
        });
      };
    },
  };
}

// SEO Plugin: Generate sitemap.xml, robots.txt, and JSON-LD
function seoPlugin() {
  const pages = [
    { path: '', changefreq: 'weekly', priority: 1.0 },
    { path: 'furniture.html', changefreq: 'weekly', priority: 0.8 },
    { path: 'decor.html', changefreq: 'weekly', priority: 0.8 },
    { path: 'electronics.html', changefreq: 'weekly', priority: 0.8 },
    { path: 'contact.html', changefreq: 'monthly', priority: 0.6 },
  ];

  return {
    name: 'seo-generator',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist');

      // Generate sitemap.xml
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${SITE_URL}/${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

      fs.writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap);
      console.log('Generated: sitemap.xml');

      // Generate robots.txt
      const robots = `# Griham Spaces - Robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay (optional)
Crawl-delay: 10`;

      fs.writeFileSync(resolve(outDir, 'robots.txt'), robots);
      console.log('Generated: robots.txt');
    },
  };
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: jsEntries,
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    htmlGeneratorPlugin(),
    seoPlugin(),
    {
      name: 'copy-assets',
      closeBundle() {
        const rootFiles = ['styles.css', 'script.js'];
        for (const file of rootFiles) {
          if (fs.existsSync(resolve(__dirname, file))) {
            fs.copyFileSync(
              resolve(__dirname, file),
              resolve(__dirname, 'dist', file)
            );
          }
        }
      },
    },
  ],
  server: {
    port: 3000,
    open: true,
  },
});