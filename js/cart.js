/* ============================================
   NAVIGATOR KIDS AI - CART SYSTEM (FINAL LAUNCH VERSION)
   Status: SYNCED with Stripe Backend
   ============================================ */

(function() {
    'use strict';
    const CART_CONFIG = { storageKey: 'navigatorCart', currency: 'USD' };

    // 🔒 PRODUCT CATALOG
    // CRITICAL: These IDs must match the keys in api/create-checkout.js
    const PRODUCTS = {
        // === TIER 4: BUNDLES ===
        'prod_bundle_total': {
            id: 'prod_bundle_total',
            name: 'Navigator Total Access Bundle',
            description: 'The Complete Ecosystem. All Systems + Bonuses.',
            price: 97.00,
            originalPrice: 197.00,
            icon: '🏆',
            downloadUrl: '/downloads/bundles/total-access-pass.zip', 
            isBundle: true,
            isNew: true
        },
        'prod_bundle_school': {
            id: 'prod_bundle_school',
            name: 'School Success Bundle',
            description: 'IEP Advocacy + Social Navigation System.',
            price: 79.00,
            icon: '🎓',
            downloadUrl: '/downloads/bundles/school-success.zip',
            isBundle: true
        },
        'prod_bundle_peace': {
            id: 'prod_bundle_peace',
            name: 'Peace at Home Bundle',
            description: 'Meltdown System + Morning Launch + Anxiety Workbook.',
            price: 57.00,
            icon: '🏠',
            downloadUrl: '/downloads/bundles/peace-at-home.zip',
            isBundle: true
        },

        // === TIER 3: CORE SYSTEMS ===
        'prod_system_iep': {
            id: 'prod_system_iep',
            name: 'The IEP Advocacy System',
            price: 67.00,
            icon: '⚖️',
            downloadUrl: '/downloads/systems/The_IEP_Advocacy_System_Premium.pdf'
        },
        'prod_system_social': {
            id: 'prod_system_social',
            name: 'The Social Navigation System',
            price: 47.00,
            icon: '🚦',
            downloadUrl: '/downloads/systems/Social_Navigation_System_Final_26Page.pdf'
        },
        'prod_system_meltdown': {
            id: 'prod_system_meltdown',
            name: 'The Meltdown Navigation System',
            price: 37.00,
            icon: '🧯',
            downloadUrl: '/downloads/systems/The_2e_Meltdown_Navigation_System.pdf'
        },

        // === TIER 2: QUICK WINS ===
        'prod_system_morning': {
            id: 'prod_system_morning',
            name: 'The Morning Launch System',
            price: 27.00,
            icon: '☀️',
            downloadUrl: '/downloads/systems/The_Morning_Launch_System_Prompt_Library.pdf'
        },
        'prod_workbook_anxiety': {
            id: 'prod_workbook_anxiety',
            name: 'Junior Agent Anxiety Workbook',
            price: 19.00,
            icon: '🕵️',
            downloadUrl: '/downloads/systems/Junior_Agent_Anxiety_Workbook_Final.pdf'
        },

        // === TIER 1: ACTIVITY PACKETS ($9.00) ===
        'prod_packet_bravely': {
            id: 'prod_packet_bravely',
            name: 'Activity Pack: Bravely the Lion',
            description: 'Game + Field Guide for Bold Explorers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'bold-explorer',
            icon: '🦁',
            downloadUrl: '/downloads/activity-packets/bravely-kit.zip'
        },
        'prod_packet_cosmo': {
            id: 'prod_packet_cosmo',
            name: 'Activity Pack: Cosmo',
            description: 'Game + Mission for Big Picture Thinkers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'big-picture-thinker',
            icon: '🚀',
            downloadUrl: '/downloads/activity-packets/cosmo-kit.zip'
        },
        'prod_packet_ember': {
            id: 'prod_packet_ember',
            name: 'Activity Pack: Ember',
            description: 'Game + Guide for Intense Feelers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'intense-feeler',
            icon: '🔥',
            downloadUrl: '/downloads/activity-packets/ember-kit.zip'
        },
        'prod_packet_shelly': {
            id: 'prod_packet_shelly',
            name: 'Activity Pack: Shelly',
            description: 'Game + Guide for Reluctant Starters',
            price: 9.00,
            category: 'activity-packet',
            profile: 'reluctant-starter',
            icon: '🐢',
            downloadUrl: '/downloads/activity-packets/shelly-kit.zip'
        },
        'prod_packet_sketch': {
            id: 'prod_packet_sketch',
            name: 'Activity Pack: Sketch',
            description: 'Game + Guide for Deep Divers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'deep-diver',
            icon: '🦉',
            downloadUrl: '/downloads/activity-packets/sketch-kit.zip'
        },
        'prod_packet_whisper': {
            id: 'prod_packet_whisper',
            name: 'Activity Pack: Whisper',
            description: 'Game + Guide for Sensitive Observers',
            price: 9.00,
            category: 'activity-packet',
            profile: 'sensitive-observer',
            icon: '🐰',
            downloadUrl: '/downloads/activity-packets/whisper-kit.zip'
        }
    };

    // [KEEP CART CLASS LOGIC BELOW]
    // Copy the rest of the Cart Class (constructor, add, remove, etc.) from your previous file.
    // ...
    
    // --- MINIFIED CART CLASS FOR CONTEXT ---
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
        
        // Notification
        showAddedNotification(product) { 
             // ... keep your notification logic ...
             alert(product.name + " added to cart!"); 
        }
    }

    // Checkout Function
    function checkout() {
        if (cart.isEmpty()) return alert('Cart is empty');
        
        // Show loading state
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

    // Init
    const cart = new Cart();
    window.NavigatorCart = { add: (id) => cart.add(id), remove: (id) => cart.remove(id), checkout, getItemCount: () => cart.getItemCount() };
})();
