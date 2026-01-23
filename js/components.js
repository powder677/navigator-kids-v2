/* ============================================
   NAVIGATOR KIDS AI - COMPONENTS
   components.js - Header/Footer injection + utilities
   ============================================ */

(function() {
    'use strict';

    // =========================================
    // CONFIGURATION
    // =========================================
    const CONFIG = {
        headerElementId: 'header',
        footerElementId: 'footer',
        mobileBreakpoint: 768,
        scrollThreshold: 50
    };

    // =========================================
    // HEADER HTML
    // =========================================
    const headerHTML = `
    <nav class="navbar" id="navbar">
        <div class="container nav-content">
            <a href="/" class="logo">
                <span class="logo-icon">🧭</span>
                Navigator Kids AI
            </a>

            <div class="nav-links" id="navLinks">
                <a href="/quiz/">Free Quiz</a>
                <a href="/resources/">Resources</a>
                <a href="/products/">Tools</a>
                <a href="/about/">About</a>
                <a href="/cart/" class="nav-cart" id="navCart">
                    🛒
                    <span class="nav-cart-count" id="navCartCount"></span>
                </a>
                <a href="/quiz/" class="btn btn-primary nav-btn">Take the Quiz</a>
            </div>

            <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>

        <div class="mobile-menu" id="mobileMenu">
            <a href="/quiz/">Free Quiz</a>
            <a href="/resources/">Resources</a>
            <a href="/products/">Tools</a>
            <a href="/about/">About</a>
            <a href="/cart/">Cart (<span class="mobile-cart-count">0</span>)</a>
            <a href="/quiz/" class="btn btn-primary">Take the Quiz</a>
        </div>
    </nav>
    `;

    // =========================================
    // FOOTER HTML
    // =========================================
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <a href="/" class="logo">
                        <span class="logo-icon">🧭</span>
                        Navigator Kids AI
                    </a>
                    <p>Your child's brain didn't come with a manual. Until now.</p>
                </div>

                <div class="footer-links">
                    <h4>Resources</h4>
                    <a href="/quiz/">Free Quiz</a>
                    <a href="/free/de-escalation-kit/">De-Escalation Kit</a>
                    <a href="/resources/">Articles</a>
                </div>

                <div class="footer-links">
                    <h4>Products</h4>
                    <a href="/products/ai-prompts/">AI Prompt Packs</a>
                    <a href="/products/activity-packets/">Activity Packets</a>
                </div>

                <div class="footer-links">
                    <h4>Company</h4>
                    <a href="/about/">About Us</a>
                    <a href="/contact/">Contact</a>
                    <a href="/terms/">Terms</a>
                    <a href="/privacy/">Privacy</a>
                </div>
            </div>

            <div class="footer-bottom">
                <p>© ${new Date().getFullYear()} Navigator Kids AI™. All rights reserved.</p>
                <p class="footer-disclaimer">
                    <strong>Disclaimer:</strong> This website provides educational information for parents. 
                    It is not a substitute for professional medical, psychological, or educational advice, diagnosis, or treatment.
                </p>
            </div>
        </div>
    </footer>
    `;

    // =========================================
    // INJECT COMPONENTS
    // =========================================
    function injectComponents() {
        // Inject Header
        const headerElement = document.getElementById(CONFIG.headerElementId);
        if (headerElement) {
            headerElement.innerHTML = headerHTML;
            initNavigation();
        }

        // Inject Footer
        const footerElement = document.getElementById(CONFIG.footerElementId);
        if (footerElement) {
            footerElement.innerHTML = footerHTML;
        }

        // Update cart counts
        updateCartDisplay();
    }

    // =========================================
    // NAVIGATION FUNCTIONALITY
    // =========================================
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        const navbar = document.getElementById('navbar');

        if (!navToggle || !mobileMenu) return;

        // Mobile menu toggle
        navToggle.addEventListener('click', function() {
            const isOpen = mobileMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close mobile menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !navToggle.contains(e.target)) {
                mobileMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Navbar scroll behavior
        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    handleScroll(navbar, lastScroll);
                    lastScroll = window.pageYOffset;
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Set active nav link based on current page
        setActiveNavLink();
    }

    function handleScroll(navbar, lastScroll) {
        const currentScroll = window.pageYOffset;

        // Add shadow when scrolled
        if (currentScroll > CONFIG.scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Optional: Hide/show navbar on scroll direction
        // Uncomment if you want this behavior
        /*
        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        */
    }

    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.startsWith(href) && href !== '/') {
                link.classList.add('active');
            } else if (href === '/' && currentPath === '/') {
                link.classList.add('active');
            }
        });
    }

    // =========================================
    // CART DISPLAY UPDATE
    // =========================================
    function updateCartDisplay() {
        // Get cart from localStorage (cart.js handles the actual cart logic)
        const cart = JSON.parse(localStorage.getItem('navigatorCart') || '[]');
        const itemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

        // Update all cart count displays
        const cartCounts = document.querySelectorAll('.nav-cart-count, .mobile-cart-count');
        cartCounts.forEach(el => {
            el.textContent = itemCount;
            el.setAttribute('data-count', itemCount);
        });
    }

    // Listen for cart updates from cart.js
    window.addEventListener('cartUpdated', updateCartDisplay);

    // =========================================
    // UTILITY FUNCTIONS
    // =========================================
    
    // Smooth scroll to element
    window.smoothScrollTo = function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const navHeight = CONFIG.scrollThreshold;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Debounce function
    window.debounce = function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Format currency
    window.formatCurrency = function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Check if mobile
    window.isMobile = function() {
        return window.innerWidth < CONFIG.mobileBreakpoint;
    };

    // =========================================
    // ACCESSIBILITY HELPERS
    // =========================================
    
    // Trap focus within modal/menu
    window.trapFocus = function(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    };

    // =========================================
    // ANALYTICS HELPERS (Optional)
    // =========================================
    window.trackEvent = function(category, action, label) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
        
        // Console log for debugging
        console.log('Event tracked:', { category, action, label });
    };

    // =========================================
    // INITIALIZE ON DOM READY
    // =========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectComponents);
    } else {
        injectComponents();
    }

    // Re-update cart display when page becomes visible (handles back button)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            updateCartDisplay();
        }
    });

})();
