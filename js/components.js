/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   Status: REFACTORED (Matches styles.css)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    initMobileMenu();
    updateCartCount();
    setActiveLink();
});

// 1. INJECT HEADER (Matches your CSS classes)
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
                    <span class="nav-cart-count" id="navCartCount" data-count="0">0</span>
                </a>
                
                <a href="/quiz/" class="btn btn-primary nav-btn">Take Quiz</a>
            </div>

            <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
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

    // Try to find a placeholder, otherwise prepend to body
    // This logic ensures it works even if you don't have <div id="header">
    const placeholder = document.getElementById('header');
    if (placeholder) {
        placeholder.innerHTML = headerHTML;
    } else {
        // Remove any EXISTING nav first to prevent duplicates
        const existingNav = document.querySelector('nav');
        if (existingNav) existingNav.remove();
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }
}

// 2. INJECT FOOTER (Matches your CSS classes)
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
                <p class="footer-disclaimer">Not medical advice. For educational purposes only.</p>
            </div>
        </div>
    </footer>
    `;

    const placeholder = document.getElementById('footer');
    if (placeholder) {
        placeholder.innerHTML = footerHTML;
    } else {
        // Remove any EXISTING footer first
        const existingFooter = document.querySelector('footer');
        if (existingFooter) existingFooter.remove();
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
}

// 3. MOBILE MENU LOGIC
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

// 4. CART COUNT SYNC
function updateCartCount() {
    const cartData = localStorage.getItem('navigatorCart');
    const cart = cartData ? JSON.parse(cartData) : [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const desktopBadge = document.getElementById('navCartCount');
    if (desktopBadge) {
        desktopBadge.innerText = count;
        desktopBadge.setAttribute('data-count', count);
        desktopBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    const mobileText = document.getElementById('mobileCartCount');
    if (mobileText) mobileText.innerText = count;
}

window.addEventListener('cartUpdated', updateCartCount);

// 5. ACTIVE LINK HIGHLIGHTER
function setActiveLink() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
        if (link.getAttribute('href') === path) {
            link.style.color = 'var(--color-terracotta)';
            link.style.fontWeight = '700';
        }
    });
}
