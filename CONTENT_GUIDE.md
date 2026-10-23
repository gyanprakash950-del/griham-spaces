# Griham Spaces - Content Editor Guide

This guide explains how to update website content without touching code. All content is managed through JSON data files in `src/data/`.

## Quick Start

1. **Edit the JSON files** in `src/data/`
2. **Run `npm run dev`** to preview changes locally
3. **Commit and push** to deploy automatically via GitHub Actions → Netlify

---

## Data Files Overview

| File | Purpose | Editable Fields |
|------|---------|-----------------|
| `site.json` | Global site info (name, contact, social) | All fields |
| `categories.json` | Category filters & metadata | Filters, labels, descriptions |
| `products.json` | Product catalog | All product fields |

---

## 1. Site Configuration (`src/data/site.json`)

```json
{
  "siteName": "Griham Spaces",
  "tagline": "Luxury Within Reach",
  "phone": "+91 89693 43308",
  "email": "grihamspacesofficial@gmail.com",
  "address": "Mathura Enclave, D.N. Singh Road, Kharmanchak, near Zudio Store, Bhagalpur, Bihar 812001",
  "whatsappUrl": "https://wa.me/918969343308",
  "instagramUrl": "https://www.instagram.com/grihamspaces.in/",
  "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Mathura+Enclave%2C+D.N.+Singh+Road%2C+Bhagalpur%2C+Bihar+812001"
}
```

**What to update:**
- Business name, tagline
- Phone, email, physical address
- WhatsApp, Instagram, Google Maps links

---

## 2. Categories (`src/data/categories.json`)

Each section (furniture, decor, electronics) has its own filter tabs.

```json
{
  "furniture": {
    "title": "Furniture Collection",
    "subtitle": "Find the right shape, comfort and finish for your home",
    "filters": [
      { "id": "all", "label": "All" },
      { "id": "wardrobes", "label": "Wardrobes" },
      { "id": "beds", "label": "Beds" },
      { "id": "sofas", "label": "Sofas" },
      { "id": "dining", "label": "Dining" },
      { "id": "tv", "label": "TV Units" },
      { "id": "other", "label": "Others" }
    ]
  }
}
```

**To add a new category filter:**
1. Add a new object to the `filters` array
2. `id` must be lowercase, no spaces (used in URLs: `?category=wardrobes`)
3. `label` is what users see on the tab
4. Add matching products with the same `category` value

---

## 3. Products (`src/data/products.json`)

Each product is an object in the `products` array.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique slug (lowercase, hyphens) - used for future product detail pages |
| `name` | string | Product display name |
| `category` | string | Must match a filter `id` from categories.json |
| `section` | string | One of: `furniture`, `decor`, `electronics` |
| `sectionLabel` | string | Display label for the section |
| `description` | string | Short description (1-2 sentences) |
| `price` | string | Display price (e.g., "From ₹24,999" or "Ask for today's price") |
| `badge` | string | Optional highlight: "Bestseller", "New arrival", "Popular", or "" |
| `image` | string | Main product image URL (Unsplash or self-hosted) |
| `featured` | boolean | Shows on home page if `true` |

### Optional Fields (for future product detail pages)

| Field | Type | Description |
|-------|------|-------------|
| `images` | string[] | Additional gallery images |
| `specs` | object | Key-value specifications (material, dimensions, warranty) |
| `inStock` | boolean | Availability |
| `whatsappMessage` | string | Pre-filled WhatsApp enquiry message |

### Example Product Entry

```json
{
  "id": "solid-wood-dining-table",
  "name": "Solid Wood Dining Table",
  "category": "dining",
  "section": "furniture",
  "sectionLabel": "Furniture",
  "description": "Handcrafted from sustainably sourced teak with a natural finish.",
  "price": "From ₹28,500",
  "badge": "New arrival",
  "image": "https://images.unsplash.com/photo-xxx?auto=format&fit=crop&w=900&q=80",
  "images": [
    "https://images.unsplash.com/photo-xxx?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-yyy?auto=format&fit=crop&w=900&q=80"
  ],
  "specs": {
    "material": "Solid teak wood",
    "dimensions": "180x90x75cm",
    "seats": "6-8 people",
    "warranty": "5 years"
  },
  "inStock": true,
  "featured": true,
  "whatsappMessage": "Hello, I'm interested in the Solid Wood Dining Table. Please share details and availability."
}
```

### Adding a New Product

1. Copy an existing product object
2. Generate a unique `id` (lowercase, hyphens only)
3. Update all fields
4. Set `category` to match an existing filter `id` (or add new filter first)
5. Set `section` to `furniture`, `decor`, or `electronics`
6. Set `featured: true` if it should appear on the home page
7. Save `products.json`

---

## Image Guidelines

### Current Setup
- Images loaded from Unsplash URLs (external CDN)
- **Recommended**: Download and self-host for performance (see Image Optimization section)

### Image Specs
- **Aspect ratio**: 4:3 or 1:1 works best
- **Width**: 900px minimum (for sharp display on retina)
- **Format**: WebP preferred, JPEG/PNG acceptable
- **Naming**: `product-name-1.webp`, `product-name-2.webp`

### To Self-Host Images
1. Download images to `public/images/products/`
2. Update `image` field: `/images/products/product-name.webp`
3. Run `npm run build` to verify

---

## Common Tasks

### Change Phone Number
Edit `phone` in `site.json` → appears in header, footer, contact page, WhatsApp links

### Update Instagram Handle
Edit `instagramUrl` in `site.json`

### Add a New Category (e.g., "Mattresses")
1. Add filter to `categories.json` → `furniture.filters`
2. Add products with `category: "mattresses"` in `products.json`

### Mark Product as "Bestseller"
Set `"badge": "Bestseller"` on the product

### Feature Product on Homepage
Set `"featured": true` on the product (max 4 recommended)

### Remove a Product
Delete the product object from the `products` array, or set `"inStock": false`

### Update Price
Change the `price` string (supports any format: "₹24,999", "From ₹18,900", "Ask for today's price")

---

## File Structure Reference

```
src/
├── data/
│   ├── site.json          # Global settings
│   ├── categories.json    # Filter tabs per section
│   └── products.json      # Product catalog
├── pages/
│   ├── index.html         # Home (auto-generated)
│   ├── furniture.html     # Furniture category (auto-generated)
│   ├── decor.html         # Decor category (auto-generated)
│   ├── electronics.html   # Electronics category (auto-generated)
│   └── contact.html       # Contact page (auto-generated)
├── components/
│   ├── Header.html        # Shared header (logo, nav, WhatsApp)
│   ├── Footer.html        # Shared footer (links, contact, categories)
│   ├── ProductCard.html   # Product card partial
│   └── CategoryCard.html  # Category card partial
└── scripts/
    ├── main.js            # Entry point
    └── components/        # Modular JS components
```

---

## Deployment Workflow

1. **Edit JSON files** locally
2. **Preview**: `npm run dev` → opens http://localhost:3000
3. **Commit**: `git add . && git commit -m "Update products"`
4. **Push**: `git push origin main`
5. **Auto-deploy**: GitHub Actions builds → Netlify deploys
6. **Live**: Changes appear at your Netlify URL within 1-2 minutes

---

## Need Help?

- **Technical issues**: Check GitHub Actions logs for build errors
- **Content questions**: Refer to this guide or contact the developer
- **Urgent changes**: Edit directly on GitHub web interface for quick fixes

---

*Last updated: 2026*  
*Griham Spaces — Luxury Within Reach*