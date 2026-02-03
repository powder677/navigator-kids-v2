(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------------------------------
    // 1. AUTO-FIX LAYOUT (The "Indent" Fixer)
    // ---------------------------------------------------------
    // This moves the navbar to the root body tag if it's trapped inside a container
    const nav = document.getElementById('navbar') || document.querySelector('.navbar');
    if (nav && nav.parentElement.tagName !== 'BODY') {
        console.log('🔧 Auto-fixing nested navbar layout...');
        document.body.prepend(nav); // Moves nav to the very top of the page
    }

    // ---------------------------------------------------------
    // 2. CLEANUP DUPLICATES
    // ---------------------------------------------------------
    const allNavs = document.querySelectorAll('nav.navbar');
    if (allNavs.length > 1) {
        // Keep the one we just moved to body, remove others
        for (let i = 1; i < allNavs.length; i++) {
            allNavs[i].remove();
        }
    }

    // ---------------------------------------------------------
    // 3. INITIALIZE FEATURES
    // ---------------------------------------------------------
    initMobileMenu();
    syncCartCount();
    initFormspree();
    personalizeSite();
  });

  /* ---------------- MOBILE MENU (ROBUST VERSION) ---------------- */
  function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');

    if (toggle && menu) {
      // Prevent attaching multiple listeners
      if (toggle.hasAttribute('data-init')) return;
      toggle.setAttribute('data-init', 'true');

      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Toggle visibility state
        const isHidden = menu.style.display === 'none' || menu.style.display === '';
        
        if (isHidden) {
            menu.style.display = 'flex';
            toggle.setAttribute('aria-expanded', 'true');
        } else {
            menu.style.display = 'none';
            toggle.setAttribute('aria-expanded', 'false');
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (menu.style.display === 'flex' && !menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.style.display = 'none';
            toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* ---------------- CART SYNC ---------------- */
  function syncCartCount() {
    let count = 0;
    try {
      const cart = JSON.parse(localStorage.getItem('navigatorCart')) || [];
      count = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    } catch (e) { console.error('Cart sync error', e); }

    document.querySelectorAll('.nav-cart-count, .mobile-cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  // Listen for custom event from cart.js
  window.addEventListener('cartUpdated', syncCartCount);

  /* ---------------- FORMSPREE ---------------- */
  function initFormspree() {
    document.querySelectorAll('form[data-formspree]').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn ? btn.textContent : 'Submit';
        
        if(btn) btn.textContent = 'Sending...';

        try {
            const res = await fetch('https://formspree.io/f/mnjvvpyj', {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
            });
            
            if (res.ok) {
                if (form.dataset.redirect) {
                    window.location.href = form.dataset.redirect;
                } else {
                    alert('Message sent successfully!');
                    form.reset();
                }
            } else {
                alert('There was an error sending your message.');
            }
        } catch (error) {
            alert('Connection error. Please try again.');
        } finally {
            if(btn) btn.textContent = originalText;
        }
      });
    });
  }

  /* ---------------- PERSONALIZATION ---------------- */
  function personalizeSite() {
    try {
      const profile = JSON.parse(localStorage.getItem('quizProfile'));
      if (profile && profile.childName) {
        document.querySelectorAll('.dynamic-child-name').forEach(el => 
          (el.textContent = profile.childName)
        );
      }
    } catch (e) {}
  }

})();
