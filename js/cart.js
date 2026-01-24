/* ============================================
   NAVIGATOR KIDS AI - CART SYSTEM
   cart.js - Shopping cart with Stripe Checkout
   ============================================ */

(function() {
    'use strict';

    // =========================================
    // CONFIGURATION
    // =========================================
    const CHECKOUT_API_URL = '/api/create-checkout';
    const STORAGE_KEY = 'navigatorCart';
    
    // Product catalog with details
    const PRODUCTS = {
        // Toolkits - $29
        'toolkit-emotional': {
            id: 'toolkit-emotional',
            name: 'Emotional Regulation Toolkit',
            price: 29,
            category: 'toolkit',
            description: 'For Intense Feelers & Sensitive Observers'
        },
        'toolkit-iep': {
            id: 'toolkit-iep',
            name: 'IEP Advocacy Toolkit',
            price: 29,
            category: 'toolkit',
            description: 'Navigate IEP meetings with confidence'
        },
        'toolkit-homework': {
            id: 'toolkit-homework',
            name: 'Homework & Executive Function',
            price: 29,
            category: 'toolkit',
            description: 'For Reluctant Starters & Big Picture Thinkers'
        },

        // Bundle - $67
        'bundle-complete': {
            id: 'bundle-complete',
            name: 'Complete 2e Toolkit Bundle',
            price: 67,
            category: 'bundle',
            description: 'All 3 toolkits (Save $20)'
        },

        // AI Prompt Packs - $19
        'prompts-meltdown': {
            id: 'prompts-meltdown',
            name: 'Meltdown Navigator Prompts',
            price: 19,
            category: 'prompts',
            description: '50 prompts for emotional crises'
        },
        'prompts-homework': {
            id: 'prompts-homework',
            name: 'Homework Helper Prompts',
            price: 19,
            category: 'prompts',
            description: '50 prompts for homework battles'
        },
        'prompts-iep': {
            id: 'prompts-iep',
            name: 'IEP Advocate Prompts',
            price: 19,
            category: 'prompts',
            description: '50 prompts for school advocacy'
        },
        'prompts-social': {
            id: 'prompts-social',
            name: 'Social Skills Prompts',
            price: 19,
            category: 'prompts',
            description: '50 prompts for social situations'
        },
        'prompts-morning': {
            id: 'prompts-morning',
            name: 'Morning Routine Prompts',
            price: 19,
            category: 'prompts',
            description: '50 prompts for smoother mornings'
        },
        'prompts-anxiety': {
            id: 'prompts-anxiety',
            name: 'Anxiety & Worry Prompts',
            price: 19,
            category: 'prompts',
            description: '50 prompts for anxious moments'
        },

        // Activity Packets - $9
        'activity-intense-feeler': {
            id: 'activity-intense-feeler',
            name: 'Intense Feeler Activity Packet',
            price: 9,
            category: 'activity',
            description: '15 printable activities'
        },
        'activity-reluctant-starter': {
            id: 'activity-reluctant-starter',
            name: 'Reluctant Starter Activity Packet',
            price: 9,
            category: 'activity',
            description: '15 printable activities'
        },
        'activity-deep-diver': {
            id: 'activity-deep-diver',
            name: 'Deep Diver Activity Packet',
            price: 9,
            category: 'activity',
            description: '15 printable activities'
        }
    };

    // =========================================
    // CART STATE
    // =========================================
    let cart = [];

    // =========================================
    // INITIALIZATION
    // =========================================
    function init() {
        loadCart();
        updateCartUI();
        bindEvents();
    }

    // =========================================
    // CART OPERATIONS
    // =========================================
    
    function loadCart() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            cart = saved ? JSON.parse(saved) : [];
        } catch (e) {
            cart = [];
        }
    }

    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        updateCartUI();
    }

    function addItem(productId, quantity = 1) {
        const product = PRODUCTS[productId];
        if (!product) {
            console.error('Product not found:', productId);
            return false;
        }

        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                quantity: quantity
            });
        }

        saveCart();
        showAddedFeedback(product.name);
        return true;
    }

    function removeItem(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
    }

    function updateQuantity(productId, quantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                removeItem(productId);
            } else {
                item.quantity = quantity;
                saveCart();
            }
        }
    }

    function clearCart() {
        cart = [];
        saveCart();
    }

    function getCart() {
        return [...cart];
    }

    function getCartCount() {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function getCartTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // =========================================
    // UI UPDATES
    // =========================================
    
    function updateCartUI() {
        // Update cart count badges
        const countElements = document.querySelectorAll('.cart-count, [data-cart-count]');
        const count = getCartCount();
        
        countElements.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });

        // Update cart total displays
        const totalElements = document.querySelectorAll('.cart-total, [data-cart-total]');
        totalElements.forEach(el => {
            el.textContent = '$' + getCartTotal();
        });

        // Render full cart if on cart page
        renderCartPage();
    }

    function renderCartPage() {
        const cartContainer = document.getElementById('cartItems');
        const emptyMessage = document.getElementById('cartEmpty');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartContainer) return;

        if (cart.length === 0) {
            cartContainer.style.display = 'none';
            if (cartSummary) cartSummary.style.display = 'none';
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        cartContainer.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'block';
        if (emptyMessage) emptyMessage.style.display = 'none';

        // Render cart items
        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">$${item.price}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="NavigatorCart.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="NavigatorCart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="NavigatorCart.removeItem('${item.id}')">Remove</button>
                </div>
                <div class="cart-item-total">
                    $${item.price * item.quantity}
                </div>
            </div>
        `).join('');

        // Update summary
        const subtotalEl = document.getElementById('cartSubtotal');
        const totalEl = document.getElementById('cartTotal');
        
        if (subtotalEl) subtotalEl.textContent = '$' + getCartTotal();
        if (totalEl) totalEl.textContent = '$' + getCartTotal();
    }

    function showAddedFeedback(productName) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.innerHTML = `
            <span class="cart-toast-icon">✓</span>
            <span>${productName} added to cart</span>
            <a href="/cart/" class="cart-toast-link">View Cart</a>
        `;

        // Add styles if not present
        if (!document.getElementById('cart-toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'cart-toast-styles';
            styles.textContent = `
                .cart-toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    background: #1F2937;
                    color: white;
                    padding: 16px 20px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    z-index: 9999;
                    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
                }
                .cart-toast-icon {
                    background: #22C55E;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }
                .cart-toast-link {
                    color: #60A5FA;
                    text-decoration: none;
                    font-weight: 500;
                    margin-left: 8px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // =========================================
    // EVENT BINDING
    // =========================================
    
    function bindEvents() {
        // Add to cart buttons
        document.addEventListener('click', function(e) {
            const addBtn = e.target.closest('[data-add-to-cart]');
            if (addBtn) {
                e.preventDefault();
                const productId = addBtn.dataset.addToCart;
                addItem(productId);
            }
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', handleCheckout);
        }
    }

    // =========================================
    // STRIPE CHECKOUT
    // =========================================
    
    async function handleCheckout() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Show loading state
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Processing...';
        }

        try {
            // Call our serverless function
            const response = await fetch(CHECKOUT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        id: item.id,
                        quantity: item.quantity
                    }))
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Checkout failed');
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            alert('Checkout failed: ' + error.message + '\n\nPlease try again or contact support.');
            
            // Reset button
            if (checkoutBtn) {
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Proceed to Checkout →';
            }
        }
    }

    // =========================================
    // UTILITY FUNCTIONS
    // =========================================
    
    function getProduct(productId) {
        return PRODUCTS[productId] || null;
    }

    function getAllProducts() {
        return { ...PRODUCTS };
    }

    // =========================================
    // PUBLIC API
    // =========================================
    window.NavigatorCart = {
        // Cart operations
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getCart,
        getCartCount,
        getCartTotal,
        
        // Product info
        getProduct,
        getAllProducts,
        
        // Checkout
        checkout: handleCheckout,
        
        // Re-initialize (useful after dynamic content loads)
        refresh: updateCartUI
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();            name: 'Shelly the Turtle',
            description: 'Task initiation games for Reluctant Starters',
            price: 9.00,
            category: 'activity-packet',
            profile: 'reluctant-starter',
            icon: '🐢',
            downloadUrl: '/downloads/shelly-the-turtle.html'
        },
        'packet-sketch-owl': {
            id: 'packet-sketch-owl',
            name: 'Sketch the Owl',
            description: 'Focus and creativity activities for Deep Divers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'deep-diver',
            icon: '🦉',
            downloadUrl: '/downloads/sketch-the-owl.html'
        },
        'packet-whisper-bunny': {
            id: 'packet-whisper-bunny',
            name: 'Whisper Bunny',
            description: 'Sensory-friendly activities for Sensitive Observers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'sensitive-observer',
            icon: '🐰',
            downloadUrl: '/downloads/whisper-bunny.html'
        },
        'packet-bravely-lion': {
            id: 'packet-bravely-lion',
            name: 'Bravely the Lion',
            description: 'Confidence-building adventures for Bold Explorers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'bold-explorer',
            icon: '🦁',
            downloadUrl: '/downloads/bravely-the-lion.html'
        },
        'packet-cosmo-pup': {
            id: 'packet-cosmo-pup',
            name: 'Cosmo Space Pup',
            description: 'Organization missions for Big Picture Thinkers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'big-picture-thinker',
            icon: '🚀',
            downloadUrl: '/downloads/cosmo-space-pup.html'
        },
        'packet-captain-choosy': {
            id: 'packet-captain-choosy',
            name: 'Captain Choosy',
            description: 'Decision-making activities for autonomous thinkers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'autonomy',
            icon: '🦸',
            downloadUrl: '/downloads/captain-choosy.html'
        }
    };

    // =========================================
    // CART CLASS
    // =========================================
    class Cart {
        constructor() {
            this.items = this.load();
        }

        // Load cart from localStorage
        load() {
            try {
                const data = localStorage.getItem(CART_CONFIG.storageKey);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('Error loading cart:', e);
                return [];
            }
        }

        // Save cart to localStorage
        save() {
            try {
                localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(this.items));
                this.dispatchUpdate();
            } catch (e) {
                console.error('Error saving cart:', e);
            }
        }

        // Dispatch custom event for UI updates
        dispatchUpdate() {
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: {
                    items: this.items,
                    count: this.getItemCount(),
                    total: this.getTotal()
                }
            }));
        }

        // Add item to cart
        add(productId, quantity = 1) {
            const product = PRODUCTS[productId];
            if (!product) {
                console.error('Product not found:', productId);
                return false;
            }

            const existingIndex = this.items.findIndex(item => item.id === productId);

            if (existingIndex > -1) {
                // Digital products typically don't need quantity > 1
                // But we'll support it anyway
                this.items[existingIndex].quantity += quantity;
            } else {
                this.items.push({
                    id: productId,
                    quantity: quantity,
                    addedAt: new Date().toISOString()
                });
            }

            this.save();
            this.showAddedNotification(product);
            
            // Track event
            if (typeof trackEvent === 'function') {
                trackEvent('Cart', 'Add', product.name);
            }

            return true;
        }

        // Remove item from cart
        remove(productId) {
            const index = this.items.findIndex(item => item.id === productId);
            if (index > -1) {
                const removed = this.items.splice(index, 1)[0];
                this.save();
                
                if (typeof trackEvent === 'function') {
                    trackEvent('Cart', 'Remove', productId);
                }
                
                return removed;
            }
            return null;
        }

        // Update item quantity
        updateQuantity(productId, quantity) {
            const item = this.items.find(item => item.id === productId);
            if (item) {
                if (quantity <= 0) {
                    return this.remove(productId);
                }
                item.quantity = quantity;
                this.save();
                return item;
            }
            return null;
        }

        // Clear entire cart
        clear() {
            this.items = [];
            this.save();
        }

        // Get all items with product details
        getItems() {
            return this.items.map(item => ({
                ...item,
                product: PRODUCTS[item.id]
            })).filter(item => item.product); // Filter out invalid products
        }

        // Get item count
        getItemCount() {
            return this.items.reduce((total, item) => total + item.quantity, 0);
        }

        // Get subtotal
        getSubtotal() {
            return this.items.reduce((total, item) => {
                const product = PRODUCTS[item.id];
                return total + (product ? product.price * item.quantity : 0);
            }, 0);
        }

        // Get total (same as subtotal for digital products, but could add tax/fees)
        getTotal() {
            return this.getSubtotal();
        }

        // Check if cart is empty
        isEmpty() {
            return this.items.length === 0;
        }

        // Check if product is in cart
        hasProduct(productId) {
            return this.items.some(item => item.id === productId);
        }

        // Show "Added to cart" notification
        showAddedNotification(product) {
            // Remove existing notification
            const existing = document.querySelector('.cart-notification');
            if (existing) existing.remove();

            // Create notification
            const notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.innerHTML = `
                <div class="cart-notification-content">
                    <span class="cart-notification-icon">${product.icon}</span>
                    <span class="cart-notification-text">
                        <strong>${product.name}</strong> added to cart
                    </span>
                    <a href="/cart/" class="cart-notification-link">View Cart →</a>
                </div>
            `;

            // Add styles if not already present
            if (!document.getElementById('cart-notification-styles')) {
                const styles = document.createElement('style');
                styles.id = 'cart-notification-styles';
                styles.textContent = `
                    .cart-notification {
                        position: fixed;
                        bottom: 24px;
                        right: 24px;
                        background: #3D405B;
                        color: white;
                        padding: 16px 20px;
                        border-radius: 12px;
                        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                        z-index: 10000;
                        animation: slideInUp 0.3s ease;
                    }
                    .cart-notification-content {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .cart-notification-icon {
                        font-size: 1.5rem;
                    }
                    .cart-notification-text {
                        font-size: 0.9rem;
                    }
                    .cart-notification-text strong {
                        display: block;
                    }
                    .cart-notification-link {
                        color: #81B29A;
                        font-weight: 600;
                        font-size: 0.85rem;
                        white-space: nowrap;
                    }
                    .cart-notification-link:hover {
                        color: #A8D0BA;
                    }
                    @keyframes slideInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @media (max-width: 480px) {
                        .cart-notification {
                            left: 16px;
                            right: 16px;
                            bottom: 16px;
                        }
                    }
                `;
                document.head.appendChild(styles);
            }

            document.body.appendChild(notification);

            // Remove after 4 seconds
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(20px)';
                notification.style.transition = 'all 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }
    }

    // =========================================
    // CART PAGE RENDERER
    // =========================================
    function renderCartPage() {
        const cartContainer = document.getElementById('cartContainer');
        if (!cartContainer) return;

        const items = cart.getItems();

        if (cart.isEmpty()) {
            cartContainer.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Find tools matched to your child's brain profile.</p>
                    <a href="/quiz/" class="btn btn-primary">Take the Free Quiz</a>
                </div>
            `;
            return;
        }

        const itemsHTML = items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">${item.product.icon}</div>
                <div class="cart-item-info">
                    <h4>${item.product.name}</h4>
                    <p>${item.product.description}</p>
                </div>
                <div class="cart-item-price">${formatCurrency(item.product.price)}</div>
                <button class="cart-item-remove" onclick="window.NavigatorCart.remove('${item.id}')" aria-label="Remove ${item.product.name}">
                    ✕
                </button>
            </div>
        `).join('');

        const subtotal = cart.getSubtotal();
        const total = cart.getTotal();

        cartContainer.innerHTML = `
            <div class="cart-layout">
                <div class="cart-items">
                    <h2>Your Cart (${cart.getItemCount()} items)</h2>
                    ${itemsHTML}
                </div>
                <div class="cart-summary">
                    <h3>Order Summary</h3>
                    <div class="cart-summary-row">
                        <span>Subtotal</span>
                        <span>${formatCurrency(subtotal)}</span>
                    </div>
                    <div class="cart-summary-row total">
                        <span>Total</span>
                        <span>${formatCurrency(total)}</span>
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="window.NavigatorCart.checkout()">
                        Checkout →
                    </button>
                    <p class="cart-summary-note">
                        🔒 Secure checkout powered by Stripe<br>
                        Instant download after payment
                    </p>
                </div>
            </div>
        `;
    }

    // =========================================
    // CHECKOUT - STRIPE INTEGRATION
    // =========================================
    function checkout() {
        if (cart.isEmpty()) {
            alert('Your cart is empty!');
            return;
        }

        const items = cart.getItems();
        
        // Track checkout initiation
        if (typeof trackEvent === 'function') {
            trackEvent('Cart', 'Checkout', `${cart.getItemCount()} items - ${formatCurrency(cart.getTotal())}`);
        }

        // Option 1: Stripe Payment Links (simple)
        // Build line items query string for Stripe
        // Note: You'll need to set up Stripe Payment Links or Checkout Sessions
        
        // For now, redirect to a checkout page that will handle Stripe
        const checkoutData = {
            items: items.map(item => ({
                id: item.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity
            })),
            total: cart.getTotal(),
            timestamp: new Date().toISOString()
        };

        // Store checkout data for the checkout page
        sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        
        // Redirect to checkout
        window.location.href = '/checkout/';
    }

    // =========================================
    // ADD TO CART BUTTONS
    // =========================================
    function initAddToCartButtons() {
        document.querySelectorAll('[data-add-to-cart]').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.getAttribute('data-add-to-cart');
                cart.add(productId);
                
                // Update button state
                this.textContent = '✓ Added';
                this.disabled = true;
                setTimeout(() => {
                    this.textContent = 'Add to Cart';
                    this.disabled = false;
                }, 2000);
            });
        });
    }

    // =========================================
    // UTILITY FUNCTIONS
    // =========================================
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: CART_CONFIG.currency
        }).format(amount);
    }

    // =========================================
    // INITIALIZE
    // =========================================
    const cart = new Cart();

    // Listen for cart updates to re-render cart page
    window.addEventListener('cartUpdated', renderCartPage);

    // Initialize add-to-cart buttons when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initAddToCartButtons();
            renderCartPage();
        });
    } else {
        initAddToCartButtons();
        renderCartPage();
    }

    // =========================================
    // PUBLIC API
    // =========================================
    window.NavigatorCart = {
        // Cart operations
        add: (productId, quantity) => cart.add(productId, quantity),
        remove: (productId) => {
            cart.remove(productId);
            renderCartPage();
        },
        updateQuantity: (productId, quantity) => {
            cart.updateQuantity(productId, quantity);
            renderCartPage();
        },
        clear: () => {
            cart.clear();
            renderCartPage();
        },
        
        // Getters
        getItems: () => cart.getItems(),
        getItemCount: () => cart.getItemCount(),
        getTotal: () => cart.getTotal(),
        isEmpty: () => cart.isEmpty(),
        hasProduct: (productId) => cart.hasProduct(productId),
        
        // Checkout
        checkout: checkout,
        
        // Product catalog
        getProduct: (productId) => PRODUCTS[productId],
        getAllProducts: () => PRODUCTS,
        getProductsByCategory: (category) => {
            return Object.values(PRODUCTS).filter(p => p.category === category);
        },
        getProductsByProfile: (profile) => {
            return Object.values(PRODUCTS).filter(p => p.profile === profile);
        },
        
        // Utilities
        formatCurrency: formatCurrency
    };

})();
