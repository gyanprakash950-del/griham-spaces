/**
 * API utilities for fetching data from JSON files
 */

/**
 * Fetch all products from products.json
 * @returns {Promise<Array>} Array of product objects
 */
export async function fetchProducts() {
  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch products filtered by section
 * @param {string} section - Section to filter by (furniture, decor, electronics)
 * @returns {Promise<Array>} Filtered array of product objects
 */
export async function fetchProductsBySection(section) {
  const products = await fetchProducts();
  return products.filter(product => product.section === section);
}

/**
 * Fetch products filtered by section and category
 * @param {string} section - Section to filter by
 * @param {string} category - Category to filter by (or 'all')
 * @returns {Promise<Array>} Filtered array of product objects
 */
export async function fetchProductsBySectionAndCategory(section, category) {
  const products = await fetchProductsBySection(section);
  if (category === 'all') return products;
  return products.filter(product => product.category === category);
}

/**
 * Fetch featured products
 * @returns {Promise<Array>} Array of featured product objects
 */
export async function fetchFeaturedProducts() {
  const products = await fetchProducts();
  return products.filter(product => product.featured === true);
}

/**
 * Fetch categories data from categories.json
 * @returns {Promise<Object>} Categories data object
 */
export async function fetchCategories() {
  try {
    const response = await fetch('/data/categories.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {};
  }
}

/**
 * Fetch site data from site.json
 * @returns {Promise<Object>} Site data object
 */
export async function fetchSiteData() {
  try {
    const response = await fetch('/data/site.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch site data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching site data:', error);
    return {};
  }
}