/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   Status: STABLE (No stacking, no duplication)
   ============================================ */

(function () {
  'use strict';

  // GLOBAL LOAD LOCK (critical)
  if (window.__NAVIGATOR_LAYOUT_LOADED__) return;
  window.__NAVIGATOR_LAYOUT_LOADED__ = true;

  document.addEventListener('DOMContentLoaded', () => {
    ensureDependencies();
    injectHeader();
    injectFooter();
    initMobileMenu();
    initFormspree();
    personalizeSite();
    setTimeout(syncCartCount, 300);
  });

  /* ---------------- DEPENDENCIES ---------------- */

  function ensureDependencies() {
    if (!document.querySelector('script[src*="tailwindcss"]')) {
      const s = document.createElement('script');
      s.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(s);
    }

    if (!document.querySelector('link[href*="font-awesome"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(l);
    }

    // UPDATED: Removed the slash so it finds the file in the css folder correctly
    if (!document.querySelector('link[href*="css/styles.css"]')) {
      const c = document.createElement('link');
      c.rel = 'stylesheet';
      c.href = 'css/styles.css'; 
      document.head.appendChild(c);
    }
  }

  /* ---------------- HEADER ---------------- */

  function injectHeader() {
    const headerSlot = document.getElementById('header');
    if (!headerSlot || headerSlot.dataset.loaded === 'true') return;

    headerSlot.innerHTML = `
      <nav class="navbar" id="navbar">
        <div class="container nav-content">
          <a href="/" class="logo"><span class="logo-icon">🧒</span>Navigator Kids AI</a>

          <div class="nav-links">
            <a href="/quiz/">Free Quiz</a>
            <a href="/resources/">Resources</a>
            <a href="/products/">Products</a>
            <a href="/tools/">Free Tools</a>
            <a href="/iep/" class="text-accent font-bold">IEP Hub</a>
            <a href="/cart/" class="nav-cart">
              🛒 <span class="cart-count">0</span>
            </a>
            <a href="/quiz/" class="btn btn-primary">Take the Quiz</a>
          </div>

          <button id="navToggle" class="nav-toggle" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>

        <div id="mobileMenu" class="mobile-menu">
          <a href="/quiz/">Free Quiz</a>
          <a href="/resources/">Resources</a>
          <a href="/products/">Products</a>
          <a href="/tools/">Free Tools</a>
          <a href="/iep/">IEP Advocacy Hub</a>
          <a href="/cart/">Cart (<span class="cart-count">0</span>)</a>
        </div>
      </nav>
    `;

    headerSlot.dataset.loaded = 'true';
    document.body.classList.add('has-fixed-nav');
  }

  /* ---------------- FOOTER ---------------- */

  function injectFooter() {
    const footerSlot = document.getElementById('footer');
    if (!footerSlot || footerSlot.dataset.loaded === 'true') return;

    footerSlot.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div>
              <a href="/" class="logo"><span class="logo-icon">🧒</span>Navigator Kids AI</a>
              <p>Your child's brain didn’t come with a manual.</p>
            </div>

            <div>
              <h4>Quick Links</h4>
              <a href="/quiz/">Free Quiz</a>
              <a href="/iep/">IEP Hub</a>
              <a href="/tools/">Free Tools</a>
            </div>

            <div>
              <h4>Company</h4>
              <a href="/about/">About</a>
              <a href="/contact/">Contact</a>
            </div>
          </div>

          <div class="footer-bottom">
            <p>© ${new Date().getFullYear()} Navigator Kids AI™</p>
          </div>
        </div>
      </footer>
    `;

    footerSlot.dataset.loaded = 'true';
  }

  /* ---------------- MOBILE MENU ---------------- */

  function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      toggle.classList.toggle('active');
      menu.classList.toggle('active');
      toggle.setAttribute(
        'aria-expanded',
        toggle.classList.contains('active')
      );
    });

    document.addEventListener('click', e => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- CART ---------------- */

  function syncCartCount() {
    let count = 0;
    try {
      const cart = JSON.parse(localStorage.getItem('navigatorCart')) || [];
      count = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    } catch {}

    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count ? 'inline-flex' : 'none';
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
      document
        .querySelectorAll('.dynamic-child-name')
        .forEach(el => (el.textContent = profile.childName || 'Your child'));
    } catch {}
  }
})();
