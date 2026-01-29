/* ============================================
   NAVIGATOR KIDS AI - CART SYSTEM
   Version: LAUNCH READY (Hyphenated IDs + Fixed Paths)
   ============================================ */

(function() {
    'use strict';
    const CART_CONFIG = { storageKey: 'navigatorCart', currency: 'USD' };

    // 🔒 PRODUCT CATALOG
    // CRITICAL: IDs must match api/create-checkout.js EXACTLY
    const PRODUCTS = {
        
        // === TIER 4: BUNDLES ($57 - $97) ===
        'prod-bundle-total': {
            id: 'prod-bundle-total',
            name: 'Navigator Total Access Bundle',
            description: 'The Complete Ecosystem. All Systems + Bonuses.',
            price: 97.00,
            originalPrice: 197.00,
            icon: '🏆',
            // YOU MUST CREATE THIS ZIP:
            downloadUrl: '/downloads/bundles/total-access-pass.zip', 
            isBundle: true,
            isNew: true
        },
        'prod-bundle-school': {
            id: 'prod-bundle-school',
            name: 'School Success Bundle',
            description: 'IEP Advocacy + Social Navigation System.',
            price: 79.00,
            icon: '🎓',
            // YOU MUST CREATE THIS ZIP:
            downloadUrl: '/downloads/bundles/school-success.zip',
            isBundle: true
        },
        'prod-bundle-peace': {
            id: 'prod-bundle-peace',
            name: 'Peace at Home Bundle',
            description: 'Meltdown System + Morning Launch + Anxiety Workbook.',
            price: 57.00,
            icon: '🏠',
            // YOU MUST CREATE THIS ZIP:
            downloadUrl: '/downloads/bundles/peace-at-home.zip',
            isBundle: true
        },

        // === TIER 3: CORE SYSTEMS ($37 - $67) ===
        'prod-system-iep': {
            id: 'prod-system-iep',
            name: 'The IEP Advocacy System',
            price: 67.00,
            icon: '⚖️',
            // PATH VERIFIED:
            downloadUrl: '/downloads/prompt-packs/The_IEP_Advocacy_System_Premium.pdf'
        },
        'prod-system-social': {
            id: 'prod-system-social',
            name: 'The Social Navigation System',
            price: 47.00,
            icon: '🚦',
            // PATH VERIFIED:
            downloadUrl: '/downloads/prompt-packs/Social_Navigation_System_Final_26Page.pdf'
        },
        'prod-system-meltdown': {
            id: 'prod-system-meltdown',
            name: 'The Meltdown Navigation System',
            price: 37.00,
            icon: '🧯',
            // PATH VERIFIED:
            downloadUrl: '/downloads/prompt-packs/The_2e_Meltdown_Navigation_System.pdf'
        },

        // === TIER 2: QUICK WINS ($19 - $27) ===
        'prod-system-morning': {
            id: 'prod-system-morning',
            name: 'The Morning Launch System',
            price: 27.00,
            icon: '☀️',
            // PATH VERIFIED:
            downloadUrl: '/downloads/prompt-packs/The_Morning_Launch_System_Prompt_Library.pdf'
        },
        'prod-workbook-anxiety': {
            id: 'prod-workbook-anxiety',
            name: 'Junior Agent Anxiety Workbook',
            price: 19.00,
            icon: '🕵️',
            // PATH VERIFIED:
            downloadUrl: '/downloads/prompt-packs/Junior_Agent_Anxiety_Workbook_Final.pdf'
        },

        // === TIER 1: ACTIVITY PACKETS ($9.00) ===
        'prod-packet-bravely': {
            id: 'prod-packet-bravely',
            name: 'Activity Pack: Bravely the Lion',
            description: 'Game + Field Guide for Bold Explorers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'bold-explorer',
            icon: '🦁',
            // YOU MUST CREATE THIS ZIP:
            downloadUrl: '/downloads/activity-packets/bravely-kit.zip'
        },
        'prod-packet-cosmo': {
            id: 'prod-packet-cosmo',
            name: 'Activity Pack: Cosmo',
            description: 'Game + Mission for Big Picture Thinkers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'big-picture-thinker',
            icon: '🚀',
            // YOU MUST CREATE THIS ZIP:
            downloadUrl: '/downloads/activity-packets/cosmo-kit.zip'
        },
        'prod-packet-ember': {
            id: 'prod-packet-ember',
            name: 'Activity Pack: Ember',
            description: 'Game + Guide for Intense Feelers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'intense-feeler',
            icon: '🔥',
            // YOU MUST CREATE THIS ZIP:
            downloadUrl: '/downloads/activity-packets/ember-kit.zip'
        },
        'prod-packet-shelly': {
            id: 'prod-packet-shelly',
            name: 'Activity Pack: Shelly',
            description: 'Game + Guide for Reluctant Starters',
            price: 9.00,
            category: 'activity-packet',
            profile: 'reluctant-starter',
            icon: '🐢',
            // YOU MUST CREATE THIS ZIP:
            downloadUrl: '/downloads/activity-packets/shelly-kit.zip'
        },
        'prod-packet-sketch': {
            id: 'prod-packet-sketch',
            name: 'Activity Pack: Sketch',
            description: 'Game + Guide for Deep Divers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'deep-diver',
            icon: '🦉',
            // YOU MUST CREATE THIS ZIP:
            downloadUrl: '/downloads/activity-packets/sketch-kit.zip'
        },
        'prod-packet-whisper': {
            id: 'prod-packet-whisper',
            name: 'Activity Pack: Whisper',
            description: 'Game + Guide for Sensitive Observers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'sensitive-observer',
            icon: '🐰',
            // YOU MUST CREATE THIS ZIP:
            downloadUrl: '/downloads/activity-packets/whisper-kit.zip'
        }
    };

    // =========================================
    // CART LOGIC
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
            return true;
        }

        // Remove item from cart
        remove(productId) {
            const index = this.items.findIndex(item => item.id === productId);
            if (index > -1) {
                const removed = this.items.splice(index, 1)[0];
                this.save();
                return removed;
            }
            return null;
        }

        // Get all items with product details
        getItems() {
            return this.items.map(item => ({
                ...item,
                product: PRODUCTS[item.id]
            })).filter(item => item.product);
        }

        // Get item count
        getItemCount() {
            return this.items.reduce((total, item) => total + item.quantity, 0);
        }

        // Get total price
        getTotal() {
            return this.items.reduce((total, item) => {
                const product = PRODUCTS[item.id];
                return total + (product ? product.price * item.quantity : 0);
            }, 0);
        }

        // Check if cart is empty
        isEmpty() {
            return this.items.length === 0;
        }

        // Show "Added to cart" notification
        showAddedNotification(product) {
            const existing = document.querySelector('.cart-notification');
            if (existing) existing.remove();

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
            
            // Add Styles
            if (!document.getElementById('cart-notif-styles')) {
                const s = document.createElement('style');
                s.id = 'cart-notif-styles';
                s.textContent = `
                    .cart-notification { position: fixed; bottom: 20px; right: 20px; background: #2D3748; color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; animation: slideUp 0.3s ease; }
                    .cart-notification-content { display: flex; align-items: center; gap: 10px; }
                    .cart-notification-link { color: #4ECDC4; font-weight: bold; margin-left: 10px; text-decoration: none; }
                    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                `;
                document.head.appendChild(s);
            }

            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    }

    // =========================================
    // CHECKOUT FUNCTION (Stripe)
    // =========================================
    function checkout() {
        if (cart.isEmpty()) return alert('Your cart is empty!');

        // Update button text
        const checkoutBtn = document.querySelector('.cart-summary button');
        const originalText = checkoutBtn ? checkoutBtn.innerText : 'Checkout';
        if(checkoutBtn) checkoutBtn.innerText = "Processing...";

        // Prepare data for backend
        const data = { 
            items: cart.getItems().map(i => ({ id: i.id, quantity: i.quantity })), 
            total: cart.getTotal() 
        };
        
        // Send to Vercel API
        fetch('/api/create-checkout', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(session => {
            if(session.error) {
                alert("Checkout Error: " + session.error);
                if(checkoutBtn) checkoutBtn.innerText = originalText;
            }
            else if(session.id) {
                // Redirect to Stripe
                // Ensure you have the Stripe script in your HTML head: <script src="https://js.stripe.com/v3/"></script>
                // Replace with your actual PUBLIC Key if not globally set
                const stripe = Stripe('pk_live_YOUR_PUBLIC_KEY_HERE'); 
                stripe.redirectToCheckout({ sessionId: session.id });
            }
        })
        .catch(err => {
            console.error(err);
            alert("Network Error. Please try again.");
            if(checkoutBtn) checkoutBtn.innerText = originalText;
        });
    }

    // =========================================
    // PAGE RENDERER (Cart Page)
    // =========================================
    function renderCartPage() {
        const container = document.getElementById('cartContainer');
        if (!container) return;

        if (cart.isEmpty()) {
            container.innerHTML = `<div class="text-center py-12"><h2>Your cart is empty</h2><a href="/" class="btn btn-primary mt-4">Go Shopping</a></div>`;
            return;
        }

        const itemsHTML = cart.getItems().map(item => `
            <div class="flex items-center justify-between border-b py-4">
                <div class="flex items-center gap-4">
                    <div class="text-3xl">${item.product.icon}</div>
                    <div>
                        <h4 class="font-bold">${item.product.name}</h4>
                        <p class="text-sm text-gray-500">$${item.product.price.toFixed(2)}</p>
                    </div>
                </div>
                <button onclick="window.NavigatorCart.remove('${item.id}')" class="text-red-500 hover:text-red-700">Remove</button>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
                <h2 class="text-2xl font-bold mb-6">Your Cart</h2>
                <div class="mb-8">${itemsHTML}</div>
                <div class="flex justify-between items-center border-t pt-6">
                    <span class="text-xl font-bold">Total:</span>
                    <span class="text-2xl font-bold text-[#FF6B6B]">$${cart.getTotal().toFixed(2)}</span>
                </div>
                <button onclick="window.NavigatorCart.checkout()" class="w-full bg-[#FF6B6B] text-white font-bold py-4 rounded-xl mt-6 hover:bg-[#ff5252] transition">
                    Checkout Securely →
                </button>
            </div>
        `;
    }

    // =========================================
    // INITIALIZATION
    // =========================================
    const cart = new Cart();

    // Re-render when cart changes
    window.addEventListener('cartUpdated', renderCartPage);

    // Initial Render
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderCartPage);
    } else {
        renderCartPage();
    }

    // Expose Global API
    window.NavigatorCart = {
        add: (id) => cart.add(id),
        remove: (id) => cart.remove(id),
        checkout: checkout,
        getItemCount: () => cart.getItemCount()
    };

})();
