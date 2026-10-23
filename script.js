const products = [
    {
        name: 'Alderwood Queen Bed',
        category: 'beds',
        section: 'furniture',
        label: 'Furniture',
        description: 'Warm wood tones and a timeless, sturdy frame.',
        price: 'From ₹24,999',
        badge: 'Bestseller',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Cove Lounge Sofa',
        category: 'sofas',
        section: 'furniture',
        label: 'Furniture',
        description: 'Relaxed comfort with soft, durable upholstery.',
        price: 'From ₹32,500',
        badge: 'Customer favourite',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Studio Dining Set',
        category: 'dining',
        section: 'furniture',
        label: 'Furniture',
        description: 'A welcoming table set for everyday gatherings.',
        price: 'From ₹18,900',
        badge: '',
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Linea Wardrobe',
        category: 'wardrobes',
        section: 'furniture',
        label: 'Furniture',
        description: 'Thoughtful storage with a clean modern finish.',
        price: 'From ₹21,900',
        badge: '',
        image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Arc Floor Lamp',
        category: 'lighting',
        section: 'decor',
        label: 'Decor',
        description: 'A sculptural glow for a quiet reading corner.',
        price: 'From ₹3,499',
        badge: 'New arrival',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Still Life Wall Art',
        category: 'wallart',
        section: 'decor',
        label: 'Decor',
        description: 'Soft, earthy tones to bring walls to life.',
        price: 'From ₹1,899',
        badge: '',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Handwoven Textured Rug',
        category: 'rugs',
        section: 'decor',
        label: 'Decor',
        description: 'A plush, neutral layer for living spaces.',
        price: 'From ₹4,250',
        badge: '',
        image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Sculpted Accent Mirror',
        category: 'mirrors',
        section: 'decor',
        label: 'Decor',
        description: 'An elegant statement piece for an entryway.',
        price: 'From ₹2,799',
        badge: '',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Ceramic Table Vase',
        category: 'accents',
        section: 'decor',
        label: 'Decor',
        description: 'Hand-finished texture, made for your favourite shelf.',
        price: 'From ₹899',
        badge: '',
        image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: '4K Smart Television',
        category: 'tv',
        section: 'electronics',
        label: 'Electronics',
        description: 'Vivid 4K picture and easy access to streaming.',
        price: 'Ask for today’s price',
        badge: 'Popular',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Front Load Washer',
        category: 'appliances',
        section: 'electronics',
        label: 'Electronics',
        description: 'Efficient everyday washing with modern features.',
        price: 'Ask for today’s price',
        badge: '',
        image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80'
    },
    {
        name: 'Bluetooth Soundbar',
        category: 'audio',
        section: 'electronics',
        label: 'Electronics',
        description: 'Clear dialogue and room-filling home audio.',
        price: 'Ask for today’s price',
        badge: '',
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80'
    }
];

function createProductCard(product) {
    const message = encodeURIComponent(`Hello, I'm interested in the ${product.name}. Please share details.`);
    const badge = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
    return `
        <article class="product-card">
            <div class="product-image-wrap">
                <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
                ${badge}
            </div>
            <div class="product-info">
                <span class="product-category">${product.label}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-bottom">
                    <span class="product-price">${product.price}</span>
                    <a class="product-enquire" href="https://wa.me/918969343308?text=${message}" target="_blank" rel="noopener noreferrer">Ask on WhatsApp →</a>
                </div>
            </div>
        </article>`;
}

const productGrid = document.getElementById('productsGrid');
if (productGrid) {
    const page = window.location.pathname.split('/').pop().replace('.html', '');
    const availableProducts = products.filter(product => product.section === page);
    const tabs = [...document.querySelectorAll('.filter-tab')];
    const count = document.getElementById('visibleCount');
    const emptyState = document.getElementById('noProducts');

    function showProducts(category) {
        const visibleProducts = category === 'all'
            ? availableProducts
            : availableProducts.filter(product => product.category === category);
        productGrid.innerHTML = visibleProducts.map(createProductCard).join('');
        if (count) count.textContent = String(visibleProducts.length);
        if (emptyState) emptyState.hidden = visibleProducts.length > 0;
        const selectedTab = tabs.find(tab => tab.dataset.category === category);
        if (selectedTab) productGrid.setAttribute('aria-labelledby', selectedTab.id);
    }

    function selectCategory(category, updateHash = false) {
        const matchingTab = tabs.find(tab => tab.dataset.category === category);
        if (!matchingTab) return;
        tabs.forEach(tab => {
            const selected = tab === matchingTab;
            tab.classList.toggle('active', selected);
            tab.setAttribute('aria-selected', String(selected));
        });
        showProducts(category);
        if (updateHash) history.replaceState(null, '', category === 'all' ? window.location.pathname : `#${category}`);
    }

    tabs.forEach(tab => tab.addEventListener('click', () => selectCategory(tab.dataset.category, true)));
    selectCategory(window.location.hash.slice(1) || 'all');
}

const featuredGrid = document.getElementById('featuredProducts');
if (featuredGrid) {
    const featuredProducts = [products[0], products[4], products[9], products[1]];
    featuredGrid.innerHTML = featuredProducts.map(createProductCard).join('');
}

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navMenu.addEventListener('click', event => {
        if (event.target instanceof HTMLAnchorElement) {
            navMenu.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.hidden = window.scrollY < 500;
    }, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
