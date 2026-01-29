/* ============================================
   NAVIGATOR KIDS AI - CART SYSTEM (FINAL HYPHENATED VERSION)
   Status: SYNCED with Backend (Hyphens)
   ============================================ */

(function() {
    'use strict';
    const CART_CONFIG = { storageKey: 'navigatorCart', currency: 'USD' };

    // 🔒 PRODUCT CATALOG
    // IDs match api/create-checkout.js (Hyphenated)
    const PRODUCTS = {
        // === TIER 4: BUNDLES ===
        'prod-bundle-total': {
            id: 'prod-bundle-total',
            name: 'Navigator Total Access Bundle',
            description: 'The Complete Ecosystem. All Systems + Bonuses.',
            price: 97.00,
            originalPrice: 197.00,
            icon: '🏆',
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
            downloadUrl: '/downloads/bundles/school-success.zip',
            isBundle: true
        },
        'prod-bundle-peace': {
            id: 'prod-bundle-peace',
            name: 'Peace at Home Bundle',
            description: 'Meltdown System + Morning Launch + Anxiety Workbook.',
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
            downloadUrl: '/downloads/systems/The_IEP_Advocacy_System_Premium.pdf'
        },
        'prod-system-social': {
            id: 'prod-system-social',
            name: 'The Social Navigation System',
            price: 47.00,
            icon: '🚦',
            downloadUrl: '/downloads/systems/Social_Navigation_System_Final_26Page.pdf'
        },
        'prod-system-meltdown': {
            id: 'prod-system-meltdown',
            name: 'The Meltdown Navigation System',
            price: 37.00,
            icon: '🧯',
            downloadUrl: '/downloads/systems/The_2e_Meltdown_Navigation_System.pdf'
        },

        // === TIER 2: QUICK WINS ===
        'prod-system-morning': {
            id: 'prod-system-morning',
            name: 'The Morning Launch System',
            price: 27.00,
            icon: '☀️',
            downloadUrl: '/downloads/systems/The_Morning_Launch_System_Prompt_Library.pdf'
        },
        'prod-workbook-anxiety': {
            id: 'prod-workbook-anxiety',
            name: 'Junior Agent Anxiety Workbook',
            price: 19.00,
            icon: '🕵️',
            downloadUrl: '/downloads/systems/Junior_Agent_Anxiety_Workbook_Final.pdf'
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
            downloadUrl: '/downloads/activity-packets/whisper-kit.zip'
        }
    };

    // --- CART CLASS (Minified) ---
    class Cart {
        constructor() { this.items = this.load(); }
        load() { try { return JSON.parse(localStorage.getItem(CART_CONFIG.storageKey) || '[]'); } catch (e) { return []; } }
        save() { localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(this.items)); this.dispatchUpdate(); }
        dispatchUpdate() { window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: this.items, count: this.getItemCount(), total: this.getTotal() } })); }
        add(productId, quantity = 1) {
            const product = PRODUCTS[productId];
            if (!product) return false;
            const existing = this.items.find(i => i.id === productId);
            if (existing) existing.quantity += quantity;
            else this.items.push({ id: productId, quantity, addedAt: new Date().toISOString() });
            this.save(); this.showAddedNotification(product); return true;
        }
        remove(productId) {
            const idx = this.items.findIndex(i => i.id === productId);
            if (idx > -1) { this.items.splice(idx, 1); this.save(); }
        }
        getItems() { return this.items.map(i => ({ ...i, product: PRODUCTS[i.id] })).filter(i => i.product); }
        getItemCount() { return this.items.reduce((t, i) => t + i.quantity, 0); }
        getTotal() { return this.items.reduce((t, i) => t + (PRODUCTS[i.id]?.price || 0) * i.quantity, 0); }
        isEmpty() { return this.items.length === 0; }
        
        showAddedNotification(product) { 
             alert(product.name + " added to cart!"); 
        }
    }

    // Checkout
    function checkout() {
        if (cart.isEmpty()) return alert('Cart is empty');
        
        const checkoutBtn = document.querySelector('.cart-summary button');
        if(checkoutBtn) checkoutBtn.innerText = "Processing...";

        const data = { items: cart.getItems().map(i => ({ id: i.id, quantity: i.quantity })), total: cart.getTotal() };
        
        fetch('/api/create-checkout', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(session => {
            if(session.error) alert("Checkout Error: " + session.error);
            else if(session.id) window.Stripe('YOUR_PUBLIC_KEY_HERE').redirectToCheckout({ sessionId: session.id });
        })
        .catch(err => {
            console.error(err);
            alert("Network Error. Please try again.");
            if(checkoutBtn) checkoutBtn.innerText = "Checkout ->";
        });
    }

    const cart = new Cart();
    window.NavigatorCart = { add: (id) => cart.add(id), remove: (id) => cart.remove(id), checkout, getItemCount: () => cart.getItemCount() };
})();
