/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   Status: PRODUCTION (Stable, Absolute Paths)
   ============================================ */

(function () {
  'use strict';

  // 1. GLOBAL LOAD LOCK: Prevents double injection
  if (window.__NAVIGATOR_LAYOUT_LOADED__) return;
  window.__NAVIGATOR_LAYOUT_LOADED__ = true;

  document.addEventListener('DOMContentLoaded', () => {
    ensureDependencies();
    
    // ENABLE INJECTION (Now that index.html is fixed)
    injectHeader(); 
    injectFooter(); 

    // Keep these active for functionality!
    initMobileMenu(); 
    initFormspree();
    personalizeSite();
    setTimeout(syncCartCount, 300);
  });

  /* ---------------- DEPENDENCIES ---------------- */
  function ensureDependencies() {
    // Tailwind (Only if not already in head)
    if (!document.querySelector('script[src*="tailwindcss"]')) {
      const s = document.createElement('script');
      s.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(s);
    }
    // Font Awesome (Only if not already in head)
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(l);
    }
  }

  /* ---------------- HEADER ---------------- */
  function injectHeader() {
    const headerSlot = document.getElementById('header');
    if (!headerSlot || headerSlot.dataset.loaded === 'true') return;

    // CRITICAL: All hrefs use "/" to force absolute paths
    headerSlot.innerHTML = `
      <nav class="navbar" id="navbar">
        <div class="container nav-content">
          <a href="/" class="logo"><span class="logo-icon">🧒</span>Navigator Kids AI</a>

          <div class="nav-links">
            <a href="/quiz/">Free Quiz</a>
            <a href="/iep/">IEP Guide</a>
            <a href="/iep/states/">IEP States</a>
            <a href="/iep/battle-plan.html" class="text-accent font-bold">IEP Battle Plan</a>
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
            <a href="/iep/">IEP Guide</a>
            <a href="/iep/states/">IEP States</a>
            <a href="/iep/battle-plan.html">IEP Battle Plan</a>
            <a href="/cart/">Cart (<span class="cart-count">0</span>)</a>
            <a href="/quiz/" class="btn btn-primary" style="margin-top: 1rem;">Take the Quiz</a>
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
              <a href="/iep/">IEP Guide</a>
              <a href="/iep/states/">IEP States</a>
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
    
    // We must query again because we just injected the HTML
    if (!toggle && !menu) {
        // If query failed (rare), try finding them inside the headerSlot
        // But usually standard query works after innerHTML set.
        return; 
    }

    // Re-select them to be safe after injection
    const safeToggle = document.getElementById('navToggle');
    const safeMenu = document.getElementById('mobileMenu');

    if (safeToggle && safeMenu) {
        safeToggle.addEventListener('click', e => {
          e.stopPropagation();
          safeToggle.classList.toggle('active');
          safeMenu.classList.toggle('active');
          safeToggle.setAttribute('aria-expanded', safeToggle.classList.contains('active'));
        });

        document.addEventListener('click', e => {
          if (!safeMenu.contains(e.target) && !safeToggle.contains(e.target)) {
            safeToggle.classList.remove('active');
            safeMenu.classList.remove('active');
            safeToggle.setAttribute('aria-expanded', 'false');
          }
        });
    }
  }

  /* ---------------- CART ---------------- */
  function syncCartCount() {
    let count = 0;
    try {
      const cart = JSON.parse(localStorage.getItem('navigatorCart')) || [];
      count = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    } catch (e) {
      // Fail silently if cookies are blocked
    }

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
      document.querySelectorAll('.dynamic-child-name').forEach(el => 
        (el.textContent = profile.childName || 'Your child')
      );
    } catch (e) {
       // Fail silently
    }
  }
})();
