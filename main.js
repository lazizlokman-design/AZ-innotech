// main.js - AZ INNOTECH Main JavaScript

// ===== FIREBASE INITIALIZATION =====
let db;
let storage;
let firebaseInitialized = false;

async function initializeFirebase() {
    try {
        if (typeof firebaseConfig === 'undefined') {
            console.warn('Firebase config not found. Using demo mode.');
            return false;
        }
        
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        storage = firebase.storage();
        firebaseInitialized = true;
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

// ===== STATE =====
let products = [];
let categories = [];
let reviews = [];
let selectedRating = 0;
let currentProductImages = [];
let currentImageIndex = 0;

// ===== DEMO DATA =====
const demoProducts = [
    {
        id: 'demo1',
        name: 'TP-Link Archer AX50 WiFi 6 Router',
        price: 189.99,
        description: 'High-performance WiFi 6 router with speeds up to 2400 Mbps. Perfect for gaming and 4K streaming.',
        specs: 'WiFi 6, Dual Band, 4 Gigabit Ports, MU-MIMO',
        quantity: 15,
        category: 'Routers & Modems',
        images: [],
        createdAt: new Date()
    },
    {
        id: 'demo2',
        name: 'Hikvision 4MP Dome Security Camera',
        price: 129.99,
        description: 'Professional dome camera with night vision and motion detection. IP67 weather resistant.',
        specs: '4MP Resolution, Night Vision, IP67, PoE',
        quantity: 8,
        category: 'Security Cameras',
        images: [],
        createdAt: new Date()
    },
    {
        id: 'demo3',
        name: 'Premium HDMI 2.1 Cable 2m',
        price: 24.99,
        description: 'High-speed HDMI 2.1 cable supporting 8K@60Hz and 4K@120Hz. Perfect for gaming consoles.',
        specs: 'HDMI 2.1, 8K@60Hz, 4K@120Hz, 2 meters',
        quantity: 50,
        category: 'HDMI / VGA Cables',
        images: [],
        createdAt: new Date()
    },
    {
        id: 'demo4',
        name: 'Cat6 Ethernet Cable 10m',
        price: 14.99,
        description: 'High-quality Cat6 ethernet cable for reliable network connections. Gold-plated connectors.',
        specs: 'Cat6, 10 meters, Gold-plated, RJ45',
        quantity: 100,
        category: 'Ethernet Cables',
        images: [],
        createdAt: new Date()
    },
    {
        id: 'demo5',
        name: 'Samsung Smart Digital Door Lock',
        price: 299.99,
        description: 'Advanced digital lock with fingerprint, PIN code, and smartphone access. Easy installation.',
        specs: 'Fingerprint, PIN, Smart App, Battery Powered',
        quantity: 3,
        category: 'Digital Locks',
        images: [],
        createdAt: new Date()
    },
    {
        id: 'demo6',
        name: '9U Wall Network Rack Cabinet',
        price: 149.99,
        description: 'Professional wall-mounted network cabinet for organizing network equipment. Ventilated design.',
        specs: '9U, Wall Mount, Glass Door, 45cm Depth',
        quantity: 0,
        category: 'Network Equipment',
        images: [],
        createdAt: new Date()
    }
];

const demoCategories = [
    { id: 'cat1', name: 'Routers & Modems', order: 1 },
    { id: 'cat2', name: 'Security Cameras', order: 2 },
    { id: 'cat3', name: 'Network Equipment', order: 3 },
    { id: 'cat4', name: 'HDMI / VGA Cables', order: 4 },
    { id: 'cat5', name: 'Ethernet Cables', order: 5 },
    { id: 'cat6', name: 'Digital Locks', order: 6 },
    { id: 'cat7', name: 'Electrical Accessories', order: 7 },
    { id: 'cat8', name: 'Other Electronics', order: 8 }
];

const demoReviews = [
    {
        id: 'rev1',
        name: 'John Smith',
        rating: 5,
        comment: 'Excellent service and quality products. The router I bought works perfectly!',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
        id: 'rev2',
        name: 'Sarah Johnson',
        rating: 4,
        comment: 'Great selection of network equipment. Fast delivery and good prices.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
];

// ===== DOM ELEMENTS =====
const loadingScreen = document.getElementById('loadingScreen');
const header = document.getElementById('header');
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
const searchInput = document.getElementById('searchInput');
const categoryFilters = document.getElementById('categoryFilters');
const productsGrid = document.getElementById('productsGrid');
const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');
const starRating = document.getElementById('starRating');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase
    await initializeFirebase();
    
    // Load data
    await loadLogo();
    await loadCategories();
    await loadProducts();
    await loadReviews();
    
    // Hide loading screen
    setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('hidden');
    }, 1000);
    
    // Setup event listeners
    setupEventListeners();
    
    // Update stats
    updateStats();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Header scroll
    window.addEventListener('scroll', () => {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Mobile menu toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            if (navMenu) navMenu.classList.toggle('open');
            mobileToggle.classList.toggle('active');
        });
    }
    
    // Search
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProducts, 300));
    }
    
    // Star rating
    if (starRating) {
        const starButtons = starRating.querySelectorAll('button');
        starButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedRating = parseInt(btn.dataset.rating);
                updateStarDisplay();
            });
        });
    }
    
    // Review form
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
    
    // Reservation form
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (navMenu) navMenu.classList.remove('open');
            }
        });
    });
}

// ===== DATA LOADING =====
async function loadLogo() {
    if (!firebaseInitialized) return;
    
    try {
        const doc = await db.collection('settings').doc('logo').get();
        if (doc.exists && doc.data().url) {
            const logoEl = document.getElementById('siteLogo');
            if (logoEl) {
                logoEl.innerHTML = `<img src="${doc.data().url}" alt="AZ INNOTECH Logo">`;
            }
            // Update footer logos too
            document.querySelectorAll('.logo-circle').forEach(el => {
                if (!el.id) {
                    el.innerHTML = `<img src="${doc.data().url}" alt="Logo">`;
                }
            });
        }
    } catch (error) {
        console.error('Error loading logo:', error);
    }
}

async function loadCategories() {
    if (firebaseInitialized) {
        try {
            const snapshot = await db.collection('categories').orderBy('order').get();
            categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error loading categories:', error);
            categories = demoCategories;
        }
    } else {
        categories = demoCategories;
    }
    
    renderCategoryFilters();
    renderFooterCategories();
}

async function loadProducts() {
    if (firebaseInitialized) {
        try {
            const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
            products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error loading products:', error);
            products = demoProducts;
        }
    } else {
        products = demoProducts;
    }
    
    renderProducts();
}

async function loadReviews() {
    if (firebaseInitialized) {
        try {
            const snapshot = await db.collection('reviews').orderBy('createdAt', 'desc').get();
            reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error loading reviews:', error);
            reviews = demoReviews;
        }
    } else {
        reviews = demoReviews;
    }
    
    renderReviews();
}

// ===== RENDERING =====
function renderCategoryFilters() {
    if (!categoryFilters) return;
    
    let html = '<button class="filter-btn active" data-category="all">All Products</button>';
    categories.forEach(cat => {
        html += `<button class="filter-btn" data-category="${cat.name}">${cat.name}</button>`;
    });
    categoryFilters.innerHTML = html;
    
    // Add click handlers
    categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            categoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProducts();
        });
    });
}

function renderFooterCategories() {
    const footerCats = document.getElementById('footerCategories');
    if (!footerCats) return;
    
    let html = '<li><a href="products.html">All Products</a></li>';
    categories.slice(0, 5).forEach(cat => {
        html += `<li><a href="products.html?category=${encodeURIComponent(cat.name)}">${cat.name}</a></li>`;
    });
    footerCats.innerHTML = html;
}

function renderProducts(filteredProducts = null) {
    if (!productsGrid) return;
    
    const displayProducts = filteredProducts || products;
    
    if (displayProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--text-muted);">
                <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-bottom: 16px;">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <p>No products found</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    displayProducts.forEach(product => {
        const stockStatus = getStockStatus(product.quantity);
        const imageUrl = product.images && product.images.length > 0 
            ? product.images[0] 
            : generatePlaceholder(product.name);
        
        html += `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.src='${generatePlaceholder(product.name)}'">
                    <span class="product-badge ${stockStatus.class}">${stockStatus.text}</span>
                    <div class="product-actions">
                        <button class="action-btn" onclick="openQuickView('${product.id}')" title="Quick View">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                        <button class="action-btn" onclick="openImageViewer('${imageUrl}')" title="Enlarge">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category || 'Electronics'}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-meta">
                        <div class="product-price">$${product.price?.toFixed(2) || '0.00'}</div>
                        <div class="stock-indicator">
                            <span class="stock-dot ${stockStatus.dotClass}"></span>
                            ${stockStatus.stockText}
                        </div>
                    </div>
                    <div class="product-buttons">
                        <button class="btn-reserve ${product.quantity === 0 ? 'disabled' : ''}" 
                            onclick="${product.quantity === 0 ? '' : `openReservation('${product.id}')`}"
                            ${product.quantity === 0 ? 'disabled' : ''}>
                            ${product.quantity === 0 ? 'Out of Stock' : 'Reserve'}
                        </button>
                        <a href="https://wa.me/994501234567?text=I'm interested in ${encodeURIComponent(product.name)}" 
                           target="_blank" class="btn-whatsapp" title="Contact via WhatsApp">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsGrid.innerHTML = html;
}

function renderReviews() {
    if (!reviewsList) return;
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    let html = '';
    reviews.forEach(review => {
        const date = review.createdAt?.toDate?.() || new Date(review.createdAt);
        html += `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-stars">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                    <span class="review-date">${formatDate(date)}</span>
                </div>
                <p class="review-text">${review.comment}</p>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 8px;">- ${review.name}</p>
            </div>
        `;
    });
    
    reviewsList.innerHTML = html;
}

// ===== FILTERING =====
function filterProducts() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const activeCategory = categoryFilters?.querySelector('.filter-btn.active')?.dataset.category || 'all';
    
    let filtered = products;
    
    // Filter by category
    if (activeCategory !== 'all') {
        filtered = filtered.filter(p => p.category === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name?.toLowerCase().includes(searchTerm) ||
            p.description?.toLowerCase().includes(searchTerm) ||
            p.category?.toLowerCase().includes(searchTerm)
        );
    }
    
    renderProducts(filtered);
}

// ===== QUICK VIEW =====
function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('quickViewModal');
    const content = document.getElementById('quickViewContent');
    
    const stockStatus = getStockStatus(product.quantity);
    const images = product.images?.length > 0 ? product.images : [generatePlaceholder(product.name)];
    currentProductImages = images;
    currentImageIndex = 0;
    
    content.innerHTML = `
        <div class="quick-view-gallery">
            <div class="gallery-main" onclick="openImageViewer('${images[0]}')">
                <img src="${images[0]}" alt="${product.name}" id="galleryMainImg" 
                     onerror="this.src='${generatePlaceholder(product.name)}'">
            </div>
            ${images.length > 1 ? `
                <div class="gallery-thumbs">
                    ${images.map((img, i) => `
                        <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="changeGalleryImage(${i})">
                            <img src="${img}" alt="Product image ${i + 1}" onerror="this.src='${generatePlaceholder(product.name)}'">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        <div class="quick-view-info">
            <div class="product-category">${product.category || 'Electronics'}</div>
            <h2>${product.name}</h2>
            <div class="quick-view-price">$${product.price?.toFixed(2) || '0.00'}</div>
            <div class="stock-indicator" style="margin-bottom: 16px;">
                <span class="stock-dot ${stockStatus.dotClass}"></span>
                ${stockStatus.stockText}
            </div>
            <p class="quick-view-description">${product.description || 'No description available.'}</p>
            
            ${product.specs ? `
                <h4 style="margin: 24px 0 12px; font-size: 1rem;">Specifications</h4>
                <div class="specs-list">
                    ${product.specs.split(',').map(spec => `
                        <div class="spec-item">
                            <span class="spec-label">${spec.split(':')[0]?.trim() || 'Spec'}</span>
                            <span class="spec-value">${spec.split(':')[1]?.trim() || spec}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="product-buttons" style="margin-top: 24px;">
                <button class="btn-reserve ${product.quantity === 0 ? 'disabled' : ''}" 
                    onclick="${product.quantity === 0 ? '' : `openReservation('${product.id}')`}"
                    ${product.quantity === 0 ? 'disabled' : ''}>
                    ${product.quantity === 0 ? 'Out of Stock' : 'Reserve Now'}
                </button>
                <a href="https://wa.me/994501234567?text=I'm interested in ${encodeURIComponent(product.name)}" 
                   target="_blank" class="btn-whatsapp">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                </a>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    document.getElementById('quickViewModal').classList.remove('active');
    document.body.style.overflow = '';
}

function changeGalleryImage(index) {
    currentImageIndex = index;
    const mainImg = document.getElementById('galleryMainImg');
    if (mainImg) {
        mainImg.src = currentProductImages[index];
    }
    document.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// ===== RESERVATION =====
function openReservation(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.quantity === 0) return;
    
    document.getElementById('reservationProductId').value = productId;
    document.getElementById('reservationModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReservation() {
    document.getElementById('reservationModal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('reservationForm').reset();
}

async function handleReservationSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('reservationProductId').value;
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerNote = document.getElementById('customerNote').value.trim();
    
    const product = products.find(p => p.id === productId);
    
    const reservation = {
        productId,
        productName: product?.name || 'Unknown Product',
        customerName,
        customerPhone,
        customerNote,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (firebaseInitialized) {
        try {
            await db.collection('reservations').add(reservation);
            alert('Reservation submitted successfully! We will contact you soon.');
            closeReservation();
        } catch (error) {
            console.error('Error submitting reservation:', error);
            alert('Error submitting reservation. Please try again.');
        }
    } else {
        // Demo mode
        console.log('Demo reservation:', reservation);
        alert('Reservation submitted successfully! (Demo Mode)');
        closeReservation();
    }
}

// ===== REVIEWS =====
function updateStarDisplay() {
    const starButtons = starRating?.querySelectorAll('button');
    starButtons?.forEach((btn, index) => {
        btn.classList.toggle('active', index < selectedRating);
    });
}

async function handleReviewSubmit(e) {
    e.preventDefault();
    
    if (selectedRating === 0) {
        alert('Please select a rating.');
        return;
    }
    
    const name = document.getElementById('reviewName').value.trim();
    const comment = document.getElementById('reviewComment').value.trim();
    
    const review = {
        name,
        rating: selectedRating,
        comment
    };

    // مثال: اطبع الـ review في console
    console.log("Review submitted:", review);

    // إعادة تعيين النموذج إذا موجود
    const form = document.getElementById('reviewForm');
    if (form) form.reset();

    // إعادة تعيين التقييم
    selectedRating = 0;
}