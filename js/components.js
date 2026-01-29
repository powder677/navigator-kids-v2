/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   Status: REFACTORED (Syncs accurately with Cart.js)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    initMobileMenu();
    
    // DELAYED SYNC: Waits 100ms to ensure cart.js has finished "Cleaning"
    setTimeout(syncCartCount, 100);
});

// 1. INJECT HEADER
function injectHeader() {
    const headerHTML = `
    <nav class="navbar" id="navbar">
        <div class="container nav-content">
            <a href="/" class="logo">
                <span class="logo-icon">🧭</span>
                Navigator Kids AI
            </a>

            <div class="nav-links">
                <a href="/quiz/">Free Quiz</a>
                <a href="/resources/">Resources</a>
                <a href="/products/">Tools</a>
                <a href="/about/">About</a>
                
                <a href="/cart/" class="nav-cart">
                    🛒
                    <span class="nav-cart-count" id="navCartCount" data-count="0" style="display:none">0</span>
                </a>
                
                <a href="/quiz/" class="btn btn-primary nav-btn">Take Quiz</a>
            </div>

            <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
                <span></span><span></span><span></span>
            </button>
        </div>

        <div class="mobile-menu" id="mobileMenu">
            <a href="/quiz/">Free Quiz</a>
            <a href="/resources/">Resources</a>
            <a href="/products/">Shop Tools</a>
            <a href="/about/">About</a>
            <a href="/cart/">Cart (<span id="mobileCartCount">0</span>)</a>
            <a href="/quiz/" class="btn btn-primary" style="margin-top: 1rem; width: 100%;">Take Quiz</a>
        </div>
    </nav>
    `;

    const placeholder = document.getElementById('header');
    if (placeholder) placeholder.innerHTML = headerHTML;
    else document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

// 2. INJECT FOOTER
function injectFooter() {
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <a href="/" class="logo" style="color: var(--color-cream);">
                        <span class="logo-icon">🧭</span>
                        Navigator Kids AI
                    </a>
                    <p>Neuroscience-backed tools for the "spicy" brains we love.</p>
                </div>
                <div class="footer-links">
                    <h4>Resources</h4>
                    <a href="/quiz/">Free Brain Quiz</a>
                    <a href="/resources/">Parent Articles</a>
                    <a href="/tools/">Free Tools</a>
                </div>
                <div class="footer-links">
                    <h4>Shop</h4>
                    <a href="/products/">All Products</a>
                    <a href="/cart/">My Cart</a>
                </div>
                <div class="footer-links">
                    <h4>Support</h4>
                    <a href="/contact/">Contact Us</a>
                    <a href="/privacy/">Privacy Policy</a>
                    <a href="/terms/">Terms of Service</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Navigator Kids AI. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
    `;

    const placeholder = document.getElementById('footer');
    if (placeholder) placeholder.innerHTML = footerHTML;
    else if (!document.querySelector('footer')) document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// 3. MOBILE MENU
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    if (toggle && menu) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation(); 
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                toggle.classList.remove('active');
                menu.classList.remove('active');
            }
        });
    }
}

// 4. SMART CART SYNC (The Fix)
function syncCartCount() {
    let count = 0;

    // PREFERRED METHOD: Ask Cart.js directly (it knows which items are valid)
    if (window.NavigatorCart && typeof window.NavigatorCart.getItemCount === 'function') {
        count = window.NavigatorCart.getItemCount();
    } 
    // FALLBACK: Read storage if Cart.js isn't loaded yet
    else {
        try {
            const cartData = localStorage.getItem('navigatorCart');
            const cart = cartData ? JSON.parse(cartData) : [];
            count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        } catch(e) { count = 0; }
    }

    const desktopBadge = document.getElementById('navCartCount');
    if (desktopBadge) {
        desktopBadge.innerText = count;
        desktopBadge.setAttribute('data-count', count);
        desktopBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    const mobileText = document.getElementById('mobileCartCount');
    if (mobileText) mobileText.innerText = count;
}

// Listen for updates
window.addEventListener('cartUpdated', syncCartCount);
