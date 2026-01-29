/* ============================================
   NAVIGATOR KIDS AI - CART SYSTEM
   Status: LAUNCH READY (Auto-Cleanup + Clear Button)
   ============================================ */

(function() {
    'use strict';
    const CART_CONFIG = { storageKey: 'navigatorCart', currency: 'USD' };

    // 🔒 PRODUCT CATALOG
    // IDs must match api/create-checkout.js EXACTLY
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
            downloadUrl: '/downloads/prompt-packs/The_IEP_Advocacy_System_Premium.pdf'
        },
        'prod-system-social': {
            id: 'prod-system-social',
            name: 'The Social Navigation System',
            price: 47.00,
            icon: '🚦',
            downloadUrl: '/downloads/prompt-packs/Social_Navigation_System_Final_26Page.pdf'
        },
        'prod-system-meltdown': {
            id: 'prod-system-meltdown',
            name: 'The Meltdown Navigation System',
            price: 37.00,
            icon: '🧯',
            downloadUrl: '/downloads/prompt-packs/The_2e_Meltdown_Navigation_System.pdf'
        },

        // === TIER 2: QUICK WINS ===
        'prod-system-morning': {
            id: 'prod-system-morning',
            name: 'The Morning Launch System',
            price: 27.00,
            icon: '☀️',
            downloadUrl: '/downloads/prompt-packs/The_Morning_Launch_System_Prompt_Library.pdf'
        },
        'prod-workbook-anxiety': {
            id: 'prod-workbook-anxiety',
            name: 'Junior Agent Anxiety Workbook',
            price: 19.00,
            icon: '🕵️',
            downloadUrl: '/downloads/prompt-packs/Junior_Agent_Anxiety_Workbook_Final.pdf'
        },

        // === TIER 1: ACTIVITY PACKETS ===
        'prod-packet-bravely': {
            id: 'prod-packet-bravely',
            name: 'Activity Pack: Bravely the Lion',
            price: 9.00,
            icon: '🦁',
            downloadUrl: '/downloads/activity-packets/bravely-kit.zip'
        },
        'prod-packet-cosmo': {
            id: 'prod-packet-cosmo',
            name: 'Activity Pack: Cosmo',
            price: 9.00,
            icon: '🚀',
            downloadUrl: '/downloads/activity-packets/cosmo-kit.zip'
        },
        'prod-packet-ember': {
            id: 'prod-packet-ember',
            name: 'Activity Pack: Ember',
            price: 9.00,
            icon: '🔥',
            downloadUrl: '/downloads/activity-packets/ember-kit.zip'
        },
        'prod-packet-shelly': {
            id: 'prod-packet-shelly',
            name: 'Activity Pack: Shelly',
            price: 9.00,
            icon: '🐢',
            downloadUrl: '/downloads/activity-packets/shelly-kit.zip'
        },
        'prod-packet-sketch': {
            id: 'prod-packet-sketch',
            name: 'Activity Pack: Sketch',
            price: 9.00,
            icon: '🦉',
            downloadUrl: '/downloads/activity-packets/sketch-kit.zip'
        },
        'prod-packet-whisper': {
            id: 'prod-packet-whisper',
            name: 'Activity Pack: Whisper',
            price: 9.00,
            icon: '🐰',
            downloadUrl: '/downloads/activity-packets/whisper-kit.zip'
        }
    };

    // =========================================
    // CART LOGIC
    // =========================================
    class Cart {
        constructor() {
            this.items = this.load();
            this.validateCart(); // Auto-clean old items
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

        // CRITICAL FIX: Removes items that don't exist in PRODUCTS
        validateCart() {
            const initialCount = this.items.length;
            this.items = this.items.filter(item => PRODUCTS[item.id]);
            
            if (this.items.length !== initialCount) {
                console.log("Cleaned up invalid items from cart.");
                this.save();
            }
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
            
            // Inline Styles for the notification
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
            total: cart.getTotal() 
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
                const stripe = Stripe('pk_live_51Qt5UQAx6JDn4AuAu7Y7w8X7q8X7q8X7q8X7q8X7q8X7q8X7q8X7q8X7q8X7q8X'); // PASTE YOUR PUBLIC KEY
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
                    <a href="/" class="inline-block bg-[#FF6B6B] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#ff5252] transition">
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
    // INITIALIZATION
    // =========================================
    const cart = new Cart();

    window.addEventListener('cartUpdated', renderCartPage);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderCartPage);
    } else {
        renderCartPage();
    }

    // Expose API
    window.NavigatorCart = {
        add: (id) => cart.add(id),
        remove: (id) => cart.remove(id),
        clear: () => cart.clear(), // New Clear Function
        checkout: checkout,
        getItemCount: () => cart.getItemCount()
    };

})();
