(function () {
  'use strict';

 document.addEventListener('DOMContentLoaded', () => {
    // ensureDependencies(); // Optional: remove if you've added links to your <head>
    
    // DELETE OR COMMENT OUT THESE TWO LINES:
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
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', e => {
          e.stopPropagation();
          toggle.classList.toggle('active');
          menu.classList.toggle('active');
          toggle.setAttribute('aria-expanded', toggle.classList.contains('active'));
        });

        document.addEventListener('click', e => {
          if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
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
