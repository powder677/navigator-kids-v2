/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    ensureDependencies();
    injectHeader();
    injectFooter();
    // initMobileMenu is called inside injectHeader after the HTML exists
    initFormspree(); 
});

// 1. ENSURE DEPENDENCIES
function ensureDependencies() {
    // Check for Tailwind/FontAwesome if necessary
}

// 2. INJECT HEADER
async function injectHeader() {
    const headerContainer = document.getElementById('header');
    if (!headerContainer) return;

    try {
        const response = await fetch('/header.html');
        const html = await response.text();
        headerContainer.innerHTML = html;
        
        // Initialize mobile menu only AFTER the HTML is injected
        initMobileMenu();
        
        // Update cart counts if cart.js is present
        if (window.NavigatorCart) {
            window.NavigatorCart.updateUI();
        }
    } catch (err) {
        console.error('Error loading header:', err);
    }
}

// 3. INJECT FOOTER
async function injectFooter() {
    const footerContainer = document.getElementById('footer');
    if (!footerContainer) return;

    try {
        const response = await fetch('/footer.html');
        const html = await response.text();
        footerContainer.innerHTML = html;
    } catch (err) {
        console.error('Error loading footer:', err);
    }
}

// 4. MOBILE MENU LOGIC
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// 6. FORMSPREE HANDLER (Already in your file)
function initFormspree() {
    // ... (Your existing Formspree code)
}
