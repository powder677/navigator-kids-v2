/* ============================================
   NAVIGATOR KIDS AI - CART SYSTEM
   cart.js - Shopping cart with localStorage
   ============================================ */

(function() {
    'use strict';

    // =========================================
    // CONFIGURATION
    // =========================================
    const CART_CONFIG = {
        storageKey: 'navigatorCart',
        currency: 'USD',
        // Stripe Payment Links (replace with your actual links)
        stripeLinks: {
            checkout: 'https://buy.stripe.com/your-checkout-session-link'
        }
    };

    // =========================================
    // PRODUCT CATALOG
    // =========================================
    // Central product database - update prices/details here
    const PRODUCTS = {
        // AI Prompt Packs - $18 each
        'ai-prompts-intense-feeler': {
            id: 'ai-prompts-intense-feeler',
            name: 'AI Prompts: Intense Feeler',
            description: '50 prompts for emotional regulation, meltdown scripts, sensory support',
            price: 18.00,
            category: 'ai-prompts',
            profile: 'intense-feeler',
            icon: '🔥',
            downloadUrl: '/downloads/ai-prompts-intense-feeler.pdf'
        },
        'ai-prompts-reluctant-starter': {
            id: 'ai-prompts-reluctant-starter',
            name: 'AI Prompts: Reluctant Starter',
            description: '50 prompts for task initiation, homework help, motivation',
            price: 18.00,
            category: 'ai-prompts',
            profile: 'reluctant-starter',
            icon: '🐢',
            downloadUrl: '/downloads/ai-prompts-reluctant-starter.pdf'
        },
        'ai-prompts-deep-diver': {
            id: 'ai-prompts-deep-diver',
            name: 'AI Prompts: Deep Diver',
            description: '50 prompts for focus, hyperfocus channeling, interest-based learning',
            price: 18.00,
            category: 'ai-prompts',
            profile: 'deep-diver',
            icon: '🦉',
            downloadUrl: '/downloads/ai-prompts-deep-diver.pdf'
        },
        'ai-prompts-sensitive-observer': {
            id: 'ai-prompts-sensitive-observer',
            name: 'AI Prompts: Sensitive Observer',
            description: '50 prompts for sensory processing, social situations, anxiety',
            price: 18.00,
            category: 'ai-prompts',
            profile: 'sensitive-observer',
            icon: '🐰',
            downloadUrl: '/downloads/ai-prompts-sensitive-observer.pdf'
        },
        'ai-prompts-bold-explorer': {
            id: 'ai-prompts-bold-explorer',
            name: 'AI Prompts: Bold Explorer',
            description: '50 prompts for confidence building, trying new things, frustration',
            price: 18.00,
            category: 'ai-prompts',
            profile: 'bold-explorer',
            icon: '🦁',
            downloadUrl: '/downloads/ai-prompts-bold-explorer.pdf'
        },
        'ai-prompts-big-picture-thinker': {
            id: 'ai-prompts-big-picture-thinker',
            name: 'AI Prompts: Big Picture Thinker',
            description: '50 prompts for organization, transitions, executive function',
            price: 18.00,
            category: 'ai-prompts',
            profile: 'big-picture-thinker',
            icon: '🚀',
            downloadUrl: '/downloads/ai-prompts-big-picture-thinker.pdf'
        },
        'ai-prompts-complete': {
            id: 'ai-prompts-complete',
            name: 'Complete AI Prompt Library',
            description: 'All 300 prompts across all 6 profiles - best value!',
            price: 67.00,
            originalPrice: 108.00,
            category: 'ai-prompts',
            profile: 'all',
            icon: '📚',
            downloadUrl: '/downloads/ai-prompts-complete.zip',
            isBundle: true
        },

        // Activity Packets - $9 each
        'packet-ember-dragon': {
            id: 'packet-ember-dragon',
            name: 'Ember the Dragon',
            description: 'Interactive emotional regulation activities for Intense Feelers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'intense-feeler',
            icon: '🐉',
            downloadUrl: '/downloads/ember-the-dragon.html'
        },
        'packet-shelly-turtle': {
            id: 'packet-shelly-turtle',
            name: 'Shelly the Turtle',
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
