/* ============================================
   NAVIGATOR KIDS AI - CART SYSTEM
   cart.js - Consolidated & Fixed
   ============================================ */

(function() {
    'use strict';

    // =========================================
    // CONFIGURATION
    // =========================================
    const CHECKOUT_API_URL = '/api/create-checkout';
    const STORAGE_KEY = 'navigatorCart'; // Unified storage key

    // Product catalog - matches IDs used on product pages
    // Maps to Stripe category-level products
    const PRODUCTS = {
        // Activity Packets - $9 each
        'activity-packet-ember': { name: 'Ember the Dragon Packet', price: 9, icon: '🐉', type: 'Activity Packet', stripeProduct: 'activity-packet' },
        'activity-packet-shelly': { name: 'Shelly the Turtle Packet', price: 9, icon: '🐢', type: 'Activity Packet', stripeProduct: 'activity-packet' },
        'activity-packet-sketch': { name: 'Sketch the Owl Packet', price: 9, icon: '🦉', type: 'Activity Packet', stripeProduct: 'activity-packet' },
        'activity-packet-whisper': { name: 'Whisper Bunny Packet', price: 9, icon: '🐰', type: 'Activity Packet', stripeProduct: 'activity-packet' },
        'activity-packet-bravely': { name: 'Bravely the Lion Packet', price: 9, icon: '🦁', type: 'Activity Packet', stripeProduct: 'activity-packet' },
        'activity-packet-cosmo': { name: 'Cosmo Space Pup Packet', price: 9, icon: '🐕', type: 'Activity Packet', stripeProduct: 'activity-packet' },
        'activity-packet-captain-choosy': { name: 'Captain Choosy Packet', price: 9, icon: '🦜', type: 'Activity Packet', stripeProduct: 'activity-packet' },

        // AI Prompt Packs - $19 each
        'ai-prompts-intense-feeler': { name: 'Intense Feeler Prompt Pack', price: 19, icon: '🔥', type: 'AI Prompts', stripeProduct: 'ai-prompts' },
        'ai-prompts-reluctant-starter': { name: 'Reluctant Starter Prompt Pack', price: 19, icon: '🐢', type: 'AI Prompts', stripeProduct: 'ai-prompts' },
        'ai-prompts-deep-diver': { name: 'Deep Diver Prompt Pack', price: 19, icon: '🔭', type: 'AI Prompts', stripeProduct: 'ai-prompts' },
        'ai-prompts-sensitive-observer': { name: 'Sensitive Observer Prompt Pack', price: 19, icon: '🐰', type: 'AI Prompts', stripeProduct: 'ai-prompts' },
        'ai-prompts-bold-explorer': { name: 'Bold Explorer Prompt Pack', price: 19, icon: '🦁', type: 'AI Prompts', stripeProduct: 'ai-prompts' },
        'ai-prompts-big-picture-thinker': { name: 'Big Picture Thinker Prompt Pack', price: 19, icon: '🚀', type: 'AI Prompts', stripeProduct: 'ai-prompts' },

        // Bundles
        'complete-prompt-library': { name: 'Complete Prompt Library', price: 67, icon: '📦', type: 'Bundle', stripeProduct: 'complete-bundle' },
        'complete-activity-bundle': { name: 'Complete Activity Bundle', price: 47, icon: '🎨', type: 'Bundle', stripeProduct: 'complete-bundle' },
        'complete-bundle': { name: 'Everything Bundle', price: 97, icon: '🎁', type: 'Bundle', stripeProduct: 'complete-bundle' },

        // Toolkits - $29 each
        'toolkit-emotional': { name: 'Emotional Regulation Toolkit', price: 29, icon: '❤️', type: 'Toolkit', stripeProduct: 'toolkit-emotional' },
        'toolkit-iep': { name: 'IEP Advocacy Toolkit', price: 29, icon: '📋', type: 'Toolkit', stripeProduct: 'toolkit-iep' },
        'toolkit-homework': { name: 'Homework & Executive Function', price: 29, icon: '📚', type: 'Toolkit', stripeProduct: 'toolkit-homework' },

        // Complete 2e Bundle
        'bundle-complete': { name: 'Complete 2e Toolkit Bundle', price: 67, icon: '🎯', type: 'Bundle', stripeProduct: 'bundle-complete' }
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
        updateCartBadges();
        bindEvents();
        
        // If we're on the cart page, render it
        if (document.getElementById('cartItems')) {
            renderCartPage();
        }

        // Check for success flag
        if (window.location.pathname.includes('thank-you')) {
            clearCart();
        }
    }

    // =========================================
    // CART OPERATIONS
    // =========================================
    function loadCart() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            cart = saved ? JSON.parse(saved) : [];
            // Filter out invalid items
            cart = cart.filter(item => PRODUCTS[item.id]);
        } catch (e) {
            cart = [];
        }
    }

    function saveCart() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        updateCartBadges();
    }

    function addItem(productId, quantity = 1) {
        const product = PRODUCTS[productId];
        if (!product) {
            console.error('Product not found in catalog:', productId);
            return false;
        }

        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: productId,
                quantity: quantity
            });
        }

        saveCart();
        showAddedFeedback(product.name);
        
        // Re-render cart page if we're on it
        if (document.getElementById('cartItems')) {
            renderCartPage();
        }
        
        return true;
    }

    function removeItem(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        if (document.getElementById('cartItems')) {
            renderCartPage();
        }
    }

    function updateQuantity(productId, quantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                removeItem(productId);
            } else {
                item.quantity = quantity;
                saveCart();
                if (document.getElementById('cartItems')) {
                    renderCartPage();
                }
            }
        }
    }

    function clearCart() {
        cart = [];
        saveCart();
        if (document.getElementById('cartItems')) {
            renderCartPage();
        }
    }

    function getCart() {
        return cart.map(item => ({
            ...item,
            ...PRODUCTS[item.id]
        }));
    }

    function getCartCount() {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function getCartTotal() {
        return cart.reduce((sum, item) => {
            const product = PRODUCTS[item.id];
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    // =========================================
    // UI UPDATES
    // =========================================
    function updateCartBadges() {
        const count = getCartCount();
        
        // Update all cart count badges
        document.querySelectorAll('.cart-count, [data-cart-count], #cart-count').forEach(el => {
            el.textContent = count;
            // Handle display logic flexibly based on element type
            if (el.tagName === 'SPAN' || el.tagName === 'DIV') {
                el.style.display = count > 0 ? 'inline-flex' : 'none';
            }
            // Add bounce animation class if utilizing Tailwind/CSS
            el.classList.add('animate-bounce');
            setTimeout(() => el.classList.remove('animate-bounce'), 1000);
        });

        // Update cart total displays
        document.querySelectorAll('.cart-total, [data-cart-total]').forEach(el => {
            el.textContent = '$' + getCartTotal();
        });
    }

    function renderCartPage() {
        const cartContainer = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const cartSummary = document.getElementById('cartSummary');
        const suggestedSection = document.getElementById('suggestedSection');
        
        if (!cartContainer) return;

        const itemCount = document.getElementById('itemCount');
        if (itemCount) itemCount.textContent = getCartCount();

        if (cart.length === 0) {
            cartContainer.style.display = 'none';
            if (cartSummary) cartSummary.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            if (suggestedSection) suggestedSection.style.display = 'none';
            return;
        }

        cartContainer.style.display = 'flex';
        if (cartSummary) cartSummary.style.display = 'block';
        if (emptyCart) emptyCart.style.display = 'none';
        if (suggestedSection) suggestedSection.style.display = 'block';

        // Render cart items
        let html = '';
        cart.forEach(item => {
            const product = PRODUCTS[item.id];
            if (product) {
                const itemTotal = product.price * item.quantity;
                html += `
                    <div class="cart-item" data-product-id="${item.id}">
                        <div class="cart-item-image">${product.icon}</div>
                        <div class="cart-item-details">
                            <h3>${product.name}</h3>
                            <p class="cart-item-type">${product.type}</p>
                        </div>
                        <div class="cart-item-actions">
                            <span class="cart-item-price">$${itemTotal}</span>
                            <button class="remove-btn" onclick="NavigatorCart.removeItem('${item.id}')">Remove</button>
                        </div>
                    </div>
                `;
            }
        });

        cartContainer.innerHTML = html;

        // Update summary
        const total = getCartTotal();
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = '$' + total;
        if (totalEl) totalEl.textContent = '$' + total;
    }

    function showAddedFeedback(productName) {
        // Remove existing toast
        const existingToast = document.querySelector('.cart-toast');
        if (existingToast) existingToast.remove();

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
                    position: fixed; bottom: 24px; right: 24px;
                    background: #1F2937; color: white;
                    padding: 16px 20px; border-radius: 12px;
                    display: flex; align-items: center; gap: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    z-index: 9999; animation: cartToastIn 0.3s ease;
                }
                .cart-toast-icon {
                    background: #22C55E; width: 24px; height: 24px;
                    border-radius: 50%; display: flex;
                    align-items: center; justify-content: center;
                    font-size: 14px; flex-shrink: 0;
                }
                .cart-toast-link {
                    color: #60A5FA; text-decoration: none;
                    font-weight: 500; margin-left: 8px; white-space: nowrap;
                }
                .cart-toast-link:hover { text-decoration: underline; }
                @keyframes cartToastIn {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // =========================================
    // EVENT BINDING
    // =========================================
    function bindEvents() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', handleCheckout);
        }

        const checkoutLink = document.querySelector('a[href="/checkout/"]');
        if (checkoutLink && document.getElementById('cartItems')) {
            checkoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                handleCheckout();
            });
        }
    }

    // =========================================
    // STRIPE CHECKOUT
    // =========================================
    async function handleCheckout() {
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        const checkoutBtn = document.getElementById('checkoutBtn') || 
                           document.querySelector('a[href="/checkout/"]');
        const originalText = checkoutBtn ? checkoutBtn.textContent : '';
        
        if (checkoutBtn) {
            checkoutBtn.style.pointerEvents = 'none';
            checkoutBtn.textContent = 'Processing...';
        }

        try {
            const items = cart.map(item => ({
                id: item.id,
                quantity: item.quantity,
                stripeProduct: PRODUCTS[item.id]?.stripeProduct
            }));

            const response = await fetch(CHECKOUT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Checkout failed');

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            alert('Checkout failed: ' + error.message);
            
            if (checkoutBtn) {
                checkoutBtn.style.pointerEvents = '';
                checkoutBtn.textContent = originalText;
            }
        }
    }

    // =========================================
    // PUBLIC API
    // =========================================
    window.NavigatorCart = {
        addItem, removeItem, updateQuantity, clearCart,
        getCart, getCartCount, getCartTotal,
        checkout: handleCheckout,
        refresh: init
    };

    // Global Compatibility Functions (So your old buttons still work)
    window.addToCart = function(productId) {
        return addItem(productId);
    };

    window.removeFromCart = function(productId) {
        return removeItem(productId);
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
