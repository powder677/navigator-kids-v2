/* ============================================
   NAVIGATOR KIDS AI - MASTER CART SYSTEM
   Status: LAUNCH READY (V2.5 - Fixed)
   
   FIXES IN THIS VERSION:
   1. directCheckout now routes through server-side API (/api/create-checkout)
      instead of deprecated client-only redirectToCheckout with lineItems.
      Stripe removed client-only integration support — this is the correct fix.
   2. Added ensureStripeLoaded() for safety on all checkout paths
   3. Added formatCurrency + renderCartPage to public API exports
   ============================================ */

(function() {
    'use strict';
    var CART_CONFIG = { storageKey: 'navigatorCart', currency: 'USD' };

    // Stripe publishable key
    var STRIPE_PK = 'pk_live_51RbD23Ax6JDn4AuAUvhBafE2pCJpDSJRQcfAPq5YDXYNQRPsOj22xraXoLqruUDqDKqGVK937dlfXdqDqL8TS0Ly00PbDQQgDd';

    // 🔒 PRODUCT CATALOG (Verified IDs & Prices)
    var PRODUCTS = {
        // === BUNDLES ===
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

        // === CORE SYSTEMS ===
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
        'prod-system-morning': {
            id: 'prod-system-morning',
            name: 'The Morning Launch System',
            price: 27.00,
            icon: '☀️',
            downloadUrl: '/downloads/systems/morning-launch-system-prompt.zip'
        },
        'prod-workbook-anxiety': {
            id: 'prod-workbook-anxiety',
            name: 'Junior Agent Anxiety Workbook',
            price: 19.00,
            icon: '🕵️',
            downloadUrl: '/downloads/systems/junior-agent-workbook.pdf'
        },

        // === IEP BATTLE PLAN (Service — now routes through API like everything else) ===
        'prod-service-battleplan': {
           id: 'prod-service-battleplan',
           name: 'The IEP Battle Plan',
           price: 497.00,
           icon: '🛡️',
           isService: true,
           stripePrice: 'price_1SvvZ6Ax6JDn4AuASL4rewfj'
        },

        // === ACTIVITY PACKETS ($9 each) ===
        'prod-packet-bravely': { id: 'prod-packet-bravely', name: 'Pack: Bravely the Lion', price: 9.00, icon: '🦁', downloadUrl: '/downloads/activity-packets/bravely-kit.zip' },
        'prod-packet-cosmo': { id: 'prod-packet-cosmo', name: 'Pack: Cosmo Space Pup', price: 9.00, icon: '🚀', downloadUrl: '/downloads/activity-packets/cosmo-kit.zip' },
        'prod-packet-ember': { id: 'prod-packet-ember', name: 'Pack: Ember the Dragon', price: 9.00, icon: '🔥', downloadUrl: '/downloads/activity-packets/ember-kit.zip' },
        'prod-packet-shelly': { id: 'prod-packet-shelly', name: 'Pack: Shelly the Turtle', price: 9.00, icon: '🐢', downloadUrl: '/downloads/activity-packets/shelly-kit.zip' },
        'prod-packet-sketch': { id: 'prod-packet-sketch', name: 'Pack: Sketch the Owl', price: 9.00, icon: '🦉', downloadUrl: '/downloads/activity-packets/sketch-kit.zip' },
        'prod-packet-whisper': { id: 'prod-packet-whisper', name: 'Pack: Whisper the Bunny', price: 9.00, icon: '🐰', downloadUrl: '/downloads/activity-packets/whisper-kit.zip' },

        // === LEGACY IDs (Quiz result pages use underscore IDs) ===
       // FIND THIS SECTION IN js/cart.js:
'prod_combo_complete': { 
    id: 'prod_combo_complete', 
    name: 'Complete Support Plan', 
    price: 97.00, // <--- CHANGED FROM 69.00 TO 97.00
    icon: '🔥', 
    downloadUrl: '/downloads/bundles/peace-at-home.zip', 
    isBundle: true 
},
        'prod_prompt_executive': { id: 'prod_prompt_executive', name: 'AI Support System', price: 29.00, icon: '🤖', downloadUrl: '/downloads/systems/morning-launch-system-prompt.zip' }
    };

    // =========================================
    // CART CLASS
    // =========================================
    function Cart() {
        this.items = this._load();
        this._validateCart();
    }

    Cart.prototype._load = function() {
        try {
            var data = localStorage.getItem(CART_CONFIG.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    };

    Cart.prototype._save = function() {
        localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(this.items));
        this._dispatchUpdate();
        this.updateCounterUI();
    };

    Cart.prototype._validateCart = function() {
        var before = this.items.length;
        this.items = this.items.filter(function(item) { return PRODUCTS[item.id]; });
        if (this.items.length !== before) this._save();
    };

    Cart.prototype._dispatchUpdate = function() {
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: this.getItemCount(), total: this.getTotal() }}));
    };

    Cart.prototype.add = function(productId, qty) {
        qty = qty || 1;
        var product = PRODUCTS[productId];
        if (!product) return;
        var idx = -1;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id === productId) { idx = i; break; }
        }
        if (idx > -1) { this.items[idx].quantity += qty; }
        else { this.items.push({ id: productId, quantity: qty, addedAt: new Date().toISOString() }); }
        this._save();
        this._showAddedNotification(product);
    };

    Cart.prototype.remove = function(productId) {
        this.items = this.items.filter(function(i) { return i.id !== productId; });
        this._save();
    };

    Cart.prototype.clear = function() {
        this.items = [];
        this._save();
    };

    Cart.prototype.getItems = function() {
        return this.items.map(function(i) { return { id: i.id, quantity: i.quantity, product: PRODUCTS[i.id] }; }).filter(function(i) { return i.product; });
    };

    Cart.prototype.getItemCount = function() {
        return this.items.reduce(function(t, i) { return t + i.quantity; }, 0);
    };

    Cart.prototype.getTotal = function() {
        return this.items.reduce(function(t, i) { return t + (PRODUCTS[i.id] ? PRODUCTS[i.id].price * i.quantity : 0); }, 0);
    };

    Cart.prototype.isEmpty = function() { return this.items.length === 0; };

    Cart.prototype.updateCounterUI = function() {
        var count = this.getItemCount();
        document.querySelectorAll('.cart-count').forEach(function(el) {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    };

    Cart.prototype._showAddedNotification = function(product) {
        var existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();
        var n = document.createElement('div');
        n.className = 'cart-notification';
        n.innerHTML = '<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:24px;">' + product.icon + '</span><div><div style="font-weight:bold;font-size:14px;">Added to Cart</div><div style="font-size:12px;opacity:0.8;">' + product.name + '</div></div></div><a href="/cart/" style="color:#D4AF37;font-weight:bold;margin-left:15px;text-decoration:none;">View Cart →</a>';
        Object.assign(n.style, { position:'fixed', bottom:'20px', right:'20px', background:'#002347', color:'white', padding:'15px 20px', borderRadius:'12px', boxShadow:'0 10px 30px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', zIndex:'10000' });
        document.body.appendChild(n);
        setTimeout(function() { n.remove(); }, 3500);
    };

    var cart = new Cart();

    // =========================================
    // HELPERS
    // =========================================
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2);
    }

    /**
     * Ensures Stripe.js is loaded before any checkout call.
     * Injects the script if missing, or waits for it to finish loading.
     */
    function ensureStripeLoaded() {
        return new Promise(function(resolve, reject) {
            if (typeof Stripe !== 'undefined') { resolve(); return; }
            var existingScript = document.querySelector('script[src*="js.stripe.com"]');
            if (existingScript) {
                var attempts = 0;
                var check = setInterval(function() {
                    if (typeof Stripe !== 'undefined') { clearInterval(check); resolve(); }
                    else if (++attempts > 50) { clearInterval(check); reject(new Error('Stripe.js did not load in time.')); }
                }, 100);
                return;
            }
            var script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = function() { resolve(); };
            script.onerror = function() { reject(new Error('Failed to load payment system.')); };
            document.head.appendChild(script);
        });
    }

    // =========================================
    // CART CHECKOUT (regular products → API → Stripe Checkout)
    // =========================================
    async function handleCheckout() {
        if (cart.isEmpty()) return;
        var btn = document.querySelector('.checkout-trigger');
        var originalText = btn ? btn.innerText : 'Checkout';
        if (btn) { btn.disabled = true; btn.innerText = "Redirecting..."; }

        try {
            var response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.getItems().map(function(i) { return { id: i.id, quantity: i.quantity }; }),
                    successUrl: window.location.origin + '/thank-you/?session_id={CHECKOUT_SESSION_ID}',
                    cancelUrl: window.location.origin + '/cart/'
                })
            });
            var session = await response.json();
            if (session.error) throw new Error(session.error);
            if (session.id) {
                await ensureStripeLoaded();
                var stripeInstance = Stripe(STRIPE_PK);
                await stripeInstance.redirectToCheckout({ sessionId: session.id });
            } else {
                throw new Error("Session ID missing");
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert("Checkout error: " + err.message);
            if (btn) { btn.disabled = false; btn.innerText = originalText; }
        }
    }

    // =========================================
    // DIRECT CHECKOUT — FIXED (V2.5)
    //
    // OLD (broken): Used stripe.redirectToCheckout({ lineItems: [...] })
    //   which is the "client-only" pattern. Stripe has DEPRECATED and
    //   REMOVED client-only checkout integration entirely.
    //
    // NEW (fixed): Routes through the server-side API at /api/create-checkout
    //   just like regular cart checkout. The API creates a Checkout Session
    //   and we redirect using the session ID.
    // =========================================
    async function directCheckout(productId) {
        var product = PRODUCTS[productId];
        if (!product) {
            alert('Product not found. Please contact hello@navigatorkidsai.com');
            return;
        }

        if (product.isService || product.stripePrice) {
            // --- SERVICE PRODUCT (e.g. IEP Battle Plan) ---
            // Route through server-side API instead of deprecated client-only checkout
            var btns = document.querySelectorAll('[onclick*="' + productId + '"]');
            btns.forEach(function(b) { b.disabled = true; b.style.opacity = '0.6'; b.innerText = 'Redirecting to checkout…'; });

            try {
                // Determine success/cancel URLs for this product
                var successUrl = window.location.origin + '/iep/battle-plan/thank-you/?session_id={CHECKOUT_SESSION_ID}';
                var cancelUrl = window.location.origin + '/iep/';

                // Call server-side API to create a Checkout Session
                var response = await fetch('/api/create-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: [{ id: productId, quantity: 1 }],
                        successUrl: successUrl,
                        cancelUrl: cancelUrl
                    })
                });

                var session = await response.json();

                if (session.error) {
                    throw new Error(session.error);
                }

                if (session.id) {
                    // Redirect to Stripe's hosted Checkout page using session ID
                    await ensureStripeLoaded();
                    var stripeInstance = Stripe(STRIPE_PK);
                    var result = await stripeInstance.redirectToCheckout({ sessionId: session.id });
                    // redirectToCheckout only returns if there was an error
                    if (result.error) {
                        throw new Error(result.error.message);
                    }
                } else {
                    throw new Error('Could not create checkout session.');
                }

            } catch (err) {
                console.error('Stripe directCheckout error:', err);
                alert('Payment error: ' + err.message + '\nPlease try again or contact hello@navigatorkidsai.com');
                btns.forEach(function(b) {
                    b.disabled = false;
                    b.style.opacity = '1';
                    b.innerText = b.className.includes('price') ? 'Get Your Battle Plan →' : 'Get Your Battle Plan — $497';
                });
            }
        } else {
            // --- REGULAR PRODUCT ---
            // Add to cart and go to cart page
            cart.add(productId, 1);
            window.location.href = '/cart/';
        }
    }

    // =========================================
    // RENDER CART PAGE
    // =========================================
    function renderCartPage() {
        var container = document.getElementById('cartContainer');
        if (!container) return;
        if (cart.isEmpty()) {
            container.innerHTML = '<div style="text-align:center;padding:100px 20px;"><div style="font-size:64px;margin-bottom:20px;">🛒</div><h2>Your cart is empty</h2><p style="color:#6B7280;margin-bottom:30px;">Choose a support system to get started.</p><a href="/products/" style="background:#002347;color:white;padding:15px 30px;border-radius:12px;text-decoration:none;font-weight:bold;">Browse Products</a></div>';
            return;
        }

        var itemsHTML = cart.getItems().map(function(item) {
            return '<div style="display:flex;align-items:center;justify-content:space-between;padding:25px 0;border-bottom:1px solid #E5E7EB;">'
                + '<div style="display:flex;align-items:center;gap:20px;">'
                + '<div style="width:60px;height:60px;background:#F9FAFB;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:30px;">' + item.product.icon + '</div>'
                + '<div><h4 style="margin:0;font-weight:700;">' + item.product.name + '</h4><p style="margin:5px 0 0;color:#6B7280;font-size:14px;">$' + item.product.price.toFixed(2) + '</p></div>'
                + '</div>'
                + '<button onclick="window.NavigatorCart.remove(\'' + item.id + '\')" style="background:none;border:none;color:#9CA3AF;cursor:pointer;font-size:18px;"><i class="fa-solid fa-trash-can"></i></button>'
                + '</div>';
        }).join('');

        container.innerHTML = '<div style="display:grid;grid-template-columns: 1fr 350px; gap:40px; margin-top:40px;">'
            + '<div><div style="background:white;border-radius:20px;padding:30px;box-shadow:0 4px 6px rgba(0,0,0,0.02);">' + itemsHTML + '</div><button onclick="window.NavigatorCart.clear()" style="margin-top:20px;background:none;border:none;color:#E07A5F;text-decoration:underline;cursor:pointer;font-size:14px;">Empty Cart</button></div>'
            + '<div><div style="background:white;border-radius:20px;padding:30px;box-shadow:0 10px 30px rgba(0,0,0,0.05);position:sticky;top:100px;">'
            + '<h3 style="margin-top:0;">Order Summary</h3>'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin:30px 0;padding-top:20px;border-top:2px solid #F3F4F6;">'
            + '<span style="font-weight:600;color:#6B7280;">Total Due</span>'
            + '<span style="font-size:32px;font-weight:800;color:#002347;">$' + cart.getTotal().toFixed(2) + '</span>'
            + '</div>'
            + '<button class="checkout-trigger" onclick="window.NavigatorCart.checkout()" style="width:100%;background:#D4AF37;color:#002347;border:none;padding:20px;border-radius:15px;font-weight:800;font-size:18px;cursor:pointer;transition:transform 0.2s;">Checkout Securely</button>'
            + '<p style="text-align:center;font-size:12px;color:#9CA3AF;margin-top:20px;"><i class="fa-solid fa-lock"></i> SSL Encrypted Payment</p>'
            + '</div></div>'
            + '</div>';
    }

    // =========================================
    // PUBLIC API
    // =========================================
    window.NavigatorCart = {
        add: function(id, qty) { cart.add(id, qty); },
        remove: function(id) { cart.remove(id); renderCartPage(); },
        clear: function() { cart.clear(); renderCartPage(); },
        checkout: handleCheckout,
        getItems: function() { return cart.getItems(); },
        getItemCount: function() { return cart.getItemCount(); },
        getTotal: function() { return cart.getTotal(); },
        isEmpty: function() { return cart.isEmpty(); },
        getProduct: function(id) { return PRODUCTS[id]; },
        directCheckout: function(id) { return directCheckout(id); },
        formatCurrency: formatCurrency,
        renderCartPage: renderCartPage
    };

    // =========================================
    // AUTO-INIT
    // =========================================
    var run = function() { cart.updateCounterUI(); renderCartPage(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();

    window.addEventListener('cartUpdated', renderCartPage);
})();
