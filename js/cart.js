/* ============================================
   NAVIGATOR KIDS AI - CART SYSTEM
   Status: FIXED (Added Legacy IDs & Missing Products)
   ============================================ */

(function() {
    'use strict';
    const CART_CONFIG = { storageKey: 'navigatorCart', currency: 'USD' };

    // 🔒 PRODUCT CATALOG
    const PRODUCTS = {
        // === TIER 4: BUNDLES ===
        'prod-bundle-total': {
            id: 'prod-bundle-total',
            name: 'Navigator Total Access Bundle',
            price: 97.00,
            icon: '🏆',
            downloadUrl: '/downloads/bundles/total-access-pass.zip', 
            isBundle: true
        },
        'prod-bundle-school': {
            id: 'prod-bundle-school',
            name: 'School Success Bundle',
            price: 79.00,
            icon: '🎓',
            downloadUrl: '/downloads/bundles/school-success.zip',
            isBundle: true
        },
        'prod-bundle-peace': {
            id: 'prod-bundle-peace',
            name: 'Peace at Home Bundle',
            price: 57.00,
            icon: '🏠',
            downloadUrl: '/downloads/bundles/peace-at-home.zip',
            isBundle: true
        },

        // === TIER 3: CORE SYSTEMS ===
        'prod-system-iep': {
            id: 'prod-system-iep',
            name: 'The IEP Advocacy System',
            price: 67.00,
            icon: '⚖️',
            downloadUrl: '/downloads/systems/the-iep-advocacy-system-premium.pdf'
        },
        'prod-system-social': {
            id: 'prod-system-social',
            name: 'The Social Navigation System',
            price: 47.00,
            icon: '🚦',
            downloadUrl: '/downloads/systems/social-navigation-system.pdf'
        },
        'prod-system-meltdown': {
            id: 'prod-system-meltdown',
            name: 'The Meltdown Navigation System',
            price: 37.00,
            icon: '🧯',
            downloadUrl: '/downloads/systems/2e-meltdown-navigation-system.pdf'
        },

        // === TIER 2: QUICK WINS ===
        'prod-system-morning': {
            id: 'prod-system-morning',
            name: 'The Morning Launch System',
            price: 27.00,
            icon: '☀️',
            downloadUrl: '/downloads/systems/morning-launch-system-prompt.pdf'
        },
        'prod-workbook-anxiety': {
            id: 'prod-workbook-anxiety',
            name: 'Junior Agent Anxiety Workbook',
            price: 19.00,
            icon: '🕵️',
            downloadUrl: '/downloads/systems/junior-agent-workbook.pdf'
        },

        // === TIER 1: ACTIVITY PACKETS ===
        'prod-packet-bravely': { 
            id: 'prod-packet-bravely', 
            name: 'Activity Pack: Bravely', 
            price: 9.00, 
            icon: '🦁', 
            downloadUrl: '/downloads/activity-packets/bravely-the-lion.zip' 
        },
        'prod-packet-cosmo': { 
            id: 'prod-packet-cosmo', 
            name: 'Activity Pack: Cosmo', 
            price: 9.00, 
            icon: '🚀', 
            downloadUrl: '/downloads/activity-packets/cosmo-space-mission.zip' 
        },
        'prod-packet-ember': { 
            id: 'prod-packet-ember', 
            name: 'Activity Pack: Ember', 
            price: 9.00, 
            icon: '🔥', 
            downloadUrl: '/downloads/activity-packets/ember-the-dragon.zip' 
        },
        'prod-packet-shelly': { 
            id: 'prod-packet-shelly', 
            name: 'Activity Pack: Shelly', 
            price: 9.00, 
            icon: '🐢', 
            downloadUrl: '/downloads/activity-packets/shelly-the-turtle.zip' 
        },
        'prod-packet-sketch': { 
            id: 'prod-packet-sketch', 
            name: 'Activity Pack: Sketch', 
            price: 9.00, 
            icon: '🦉', 
            downloadUrl: '/downloads/activity-packets/sketch-the-owl.zip' 
        },
        'prod-packet-whisper': { 
            id: 'prod-packet-whisper', 
            name: 'Activity Pack: Whisper', 
            price: 9.00, 
            icon: '🐰', 
            downloadUrl: '/downloads/activity-packets/whisper-the-cozy.zip' 
        },

        // === HERO OFFERS & LEGACY IDs (Added for Results Pages) ===
        'prod_combo_complete': {
            id: 'prod_combo_complete',
            name: 'Complete Support Plan',
            price: 69.00,
            icon: '🔥',
            downloadUrl: '/downloads/bundles/total-access-pass.zip',
            isBundle: true
        },
        'prod_prompt_executive': {
            id: 'prod_prompt_executive',
            name: 'AI Support System',
            price: 29.00,
            icon: '🤖',
            downloadUrl: '/downloads/systems/morning-launch-system-prompt.pdf' 
        },
        'prod_packet_captain': {
            id: 'prod_packet_captain',
            name: 'Activity Pack: Captain Choosy',
            price: 9.00,
            icon: '🎯',
            downloadUrl: '/downloads/activity-packets/captain-kit.zip'
        }
    };

    // =========================================
    // CART LOGIC
    // =========================================
    class Cart {
        constructor() {
            this.items = this.load();
            this.validateCart();
        }

        load() {
            try {
                const data = localStorage.getItem(CART_CONFIG.storageKey);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('Error loading cart:', e);
                return [];
            }
        }

        save() {
            try {
                localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(this.items));
                this.dispatchUpdate();
            } catch (e) {
                console.error('Error saving cart:', e);
            }
        }

        validateCart() {
            const initialCount = this.items.length;
            this.items = this.items.filter(item => PRODUCTS[item.id]);
            if (this.items.length !== initialCount) this.save();
        }

        dispatchUpdate() {
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: {
                    items: this.items,
                    count: this.getItemCount(),
                    total: this.getTotal()
                }
            }));
        }

        formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: CART_CONFIG.currency
            }).format(amount);
        }

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

        remove(productId) {
            const index = this.items.findIndex(item => item.id === productId);
            if (index > -1) {
                this.items.splice(index, 1);
                this.save();
            }
        }

        clear() {
            this.items = [];
            this.save();
        }

        getItems() {
            return this.items.map(item => ({
                ...item,
                product: PRODUCTS[item.id]
            })).filter(item => item.product);
        }

        getItemCount() {
            return this.items.reduce((total, item) => total + item.quantity, 0);
        }

        getTotal() {
            return this.items.reduce((total, item) => {
                const product = PRODUCTS[item.id];
                return total + (product ? product.price * item.quantity : 0);
            }, 0);
        }

        isEmpty() {
            return this.items.length === 0;
        }

        showAddedNotification(product) {
            const existing = document.querySelector('.cart-notification');
            if (existing) existing.remove();

            const notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${product.icon}</span>
                    <div>
                        <div class="font-bold text-sm">Added to Cart</div>
                        <div class="text-xs opacity-90">${product.name}</div>
                    </div>
                </div>
                <a href="/cart/" class="text-[#4ECDC4] font-bold text-sm ml-4 whitespace-nowrap hover:underline">View Cart →</a>
            `;
            
            Object.assign(notification.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: '#2D3748',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                zIndex: '9999',
                animation: 'slideUp 0.3s ease-out'
            });

            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
        }
    }

    // =========================================
    // CHECKOUT FUNCTION
    // =========================================
    function checkout() {
        if (cart.isEmpty()) return alert('Your cart is empty!');

        const checkoutBtn = document.querySelector('.cart-summary button');
        const originalText = checkoutBtn ? checkoutBtn.innerText : 'Checkout';
        if(checkoutBtn) checkoutBtn.innerText = "Processing...";

        const data = { 
            items: cart.getItems().map(i => ({ id: i.id, quantity: i.quantity })), 
            successUrl: window.location.origin + '/thank-you/',
            cancelUrl: window.location.origin + '/cart/'
        };
        
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
                const stripe = Stripe('pk_live_51RbD23Ax6JDn4AuAUvhBafE2pCJpDSJRQcfAPq5YDXYNQRPsOj22xraXoLqruUDqDKqGVK937dlfXdqDqL8TS0Ly00PbDQQgDd');
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
    // PAGE RENDERER
    // =========================================
    function renderCartPage() {
        const container = document.getElementById('cartContainer');
        if (!container) return;

        if (cart.isEmpty()) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4 opacity-20">🛒</div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p class="text-gray-500 mb-6">Looks like you haven't added any tools yet.</p>
                    <a href="/products/" class="inline-block bg-[#FF6B6B] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#ff5252] transition">
                        Browse Shop
                    </a>
                </div>`;
            return;
        }

        const itemsHTML = cart.getItems().map(item => `
            <div class="flex items-center justify-between border-b border-gray-100 py-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-3xl">
                        ${item.product.icon}
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800">${item.product.name}</h4>
                        <p class="text-sm text-gray-500">$${item.product.price.toFixed(2)}</p>
                    </div>
                </div>
                <button onclick="window.NavigatorCart.remove('${item.id}')" class="text-gray-400 hover:text-red-500 transition px-3 py-2">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="grid md:grid-cols-3 gap-8">
                <div class="md:col-span-2">
                    <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        ${itemsHTML}
                    </div>
                    <div class="text-right">
                        <button onclick="window.NavigatorCart.clear()" class="text-sm text-red-400 hover:text-red-600 underline">
                            Empty Cart
                        </button>
                    </div>
                </div>
                
                <div class="md:col-span-1">
                    <div class="cart-summary bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 class="font-bold text-lg mb-4 border-b pb-4">Summary</h3>
                        <div class="flex justify-between items-center mb-6">
                            <span class="text-gray-600">Total</span>
                            <span class="text-3xl font-bold text-[#FF6B6B]">$${cart.getTotal().toFixed(2)}</span>
                        </div>
                        <button onclick="window.NavigatorCart.checkout()" class="w-full bg-[#FF6B6B] text-white font-bold py-4 rounded-xl hover:bg-[#ff5252] transition shadow-lg transform hover:-translate-y-1">
                            Checkout Securely
                        </button>
                        <p class="text-center text-xs text-gray-400 mt-4">
                            <i class="fa-solid fa-lock mr-1"></i> SSL Encrypted Payment
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================
    // INITIALIZATION & PUBLIC API
    // =========================================
    const cart = new Cart();

    window.addEventListener('cartUpdated', renderCartPage);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderCartPage);
    } else {
        renderCartPage();
    }

    window.NavigatorCart = {
        add: (id, qty) => cart.add(id, qty),
        remove: (id) => cart.remove(id),
        clear: () => cart.clear(),
        checkout: checkout,
        getItems: () => cart.getItems(),
        getItemCount: () => cart.getItemCount(),
        getTotal: () => cart.getTotal(),
        isEmpty: () => cart.isEmpty(),
        formatCurrency: (amt) => cart.formatCurrency(amt),
        renderCartPage: renderCartPage,
        getProduct: (id) => PRODUCTS[id]
    };

})();
