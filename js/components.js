(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    
    // ---------------------------------------------------------
    // 🛑 NUCLEAR FIX: REMOVE DOUBLE NAVBARS
    // ---------------------------------------------------------
    const allNavs = document.querySelectorAll('nav.navbar, nav#navbar'); 
    if (allNavs.length > 1) {
        console.warn('Found ' + allNavs.length + ' navbars. Removing duplicates.');
        // Keep the LAST one (usually the one hardcoded in HTML), remove the others
        // Or keep the FIRST one. Let's keep the one with content.
        for (let i = 1; i < allNavs.length; i++) {
            allNavs[i].remove();
        }
    }
    // ---------------------------------------------------------

    // DELETE OR COMMENT OUT THESE TWO LINES (Just to be safe):
    // injectHeader(); 
    // injectFooter(); 

    // KEEP THESE ACTIVE:
    initMobileMenu(); 
    initFormspree();
    personalizeSite();
    syncCartCount();
  });

  /* ---------------- MOBILE MENU ---------------- */
  function initMobileMenu() {
    // Select the Toggle Button
    const toggle = document.getElementById('navToggle');
    
    // Select the Menu - Handle both ID types just in case
    const menu = document.getElementById('mobileMenu'); 
    
    if (toggle && menu) {
        // Remove old event listeners to prevent double-toggling
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);

        newToggle.addEventListener('click', e => {
          e.stopPropagation();
          newToggle.classList.toggle('active');
          menu.classList.toggle('active');
          
          // Toggle "hidden" class if you are using Tailwind utilities
          if (menu.classList.contains('hidden')) {
              menu.classList.remove('hidden');
              menu.style.display = 'flex';
          } else if (menu.style.display === 'none' || menu.style.display === '') {
              menu.style.display = 'flex';
          } else {
              menu.style.display = 'none';
          }
          
          newToggle.setAttribute('aria-expanded', newToggle.classList.contains('active'));
        });

        document.addEventListener('click', e => {
          if (!menu.contains(e.target) && !newToggle.contains(e.target)) {
            newToggle.classList.remove('active');
            menu.classList.remove('active');
            menu.style.display = 'none'; // Ensure it hides
            newToggle.setAttribute('aria-expanded', 'false');
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
    } catch (e) {}

    // Update all possible cart count containers
    document.querySelectorAll('.nav-cart-count, .mobile-cart-count, .cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  window.addEventListener('cartUpdated', syncCartCount);

  /* ---------------- FORMSPREE ---------------- */
  function initFormspree() {
    document.querySelectorAll('form[data-formspree]').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const res = await fetch('https://formspree.io/f/mnjvvpyj', {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok && form.dataset.redirect) {
          window.location.href = form.dataset.redirect;
        }
      });
    });
  }

  /* ---------------- PERSONALIZATION ---------------- */
  function personalizeSite() {
    try {
      const profile = JSON.parse(localStorage.getItem('quizProfile'));
      if (!profile) return;
      document.querySelectorAll('.dynamic-child-name').forEach(el => 
        (el.textContent = profile.childName || 'Your child')
      );
    } catch (e) {}
  }
})();
