/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Inject components from root directory
    injectHeader();
    injectFooter();
    
    // Initialize standard handlers
    initFormspree(); 
});

/**
 * Loads header.html and injects it into #header
 */
async function injectHeader() {
    const container = document.getElementById('header');
    if (!container) return;

    try {
        const response = await fetch('/header.html');
        if (!response.ok) throw new Error('Header file not found');
        const html = await response.text();
        container.innerHTML = html;

        // Re-run mobile menu logic now that the HTML exists
        initMobileMenu();
        
        // Update Cart UI if cart.js is loaded
        if (window.NavigatorCart) window.NavigatorCart.updateUI();
        
    } catch (err) {
        console.error('Error injecting header:', err);
    }
}

/**
 * Loads footer.html and injects it into #footer
 */
async function injectFooter() {
    const container = document.getElementById('footer');
    if (!container) return;

    try {
        const response = await fetch('/footer.html');
        if (!response.ok) throw new Error('Footer file not found');
        const html = await response.text();
        container.innerHTML = html;
    } catch (err) {
        console.error('Error injecting footer:', err);
    }
}

/**
 * Mobile Menu Toggle Logic
 */
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

/**
 * Formspree Form Handler
 */
function initFormspree() {
    const FORMSPREE_URL = 'https://formspree.io/f/mnjvvpyj';
    
    document.querySelectorAll('form[data-formspree]').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            if (btn) { btn.disabled = true; btn.innerText = 'Sending...'; }
            
            try {
                const res = await fetch(FORMSPREE_URL, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });
                
                if (res.ok) {
                    window.location.href = form.dataset.redirect || '/thank-you/';
                }
            } catch (err) {
                alert('Submission failed. Please email support@navigatorkids.ai');
                if (btn) btn.disabled = false;
            }
        });
    });
}
