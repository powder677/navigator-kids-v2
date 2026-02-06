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
// IEP Battle Plan CTA - Global injection before footer
(function() {
   'use strict';

   // Pages where we DON'T want to show the CTA
   const excludedPaths = [
      '/iep/battle-plan/',
      '/cart/',
      '/checkout/',
      '/thank-you/',
      '/quiz/'
   ];

   // Check if current page should show CTA
   function shouldShowCTA() {
      const currentPath = window.location.pathname;
      return !excludedPaths.some(path => currentPath.includes(path));
   }

   // Detect state from URL for dynamic messaging
   function getStateFromURL() {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/texas/')) return 'Texas';
      if (path.includes('/california/') || path.includes('/ca/')) return 'California';
      if (path.includes('/new-york/') || path.includes('/ny/')) return 'New York';
      return null;
   }

   // Build the CTA HTML
   function buildCTA() {
      const state = getStateFromURL();
      const stateHeadline = state 
         ? `Knowing the <span class="text-[#d4a853]">${state} IEP Timeline</span> Is Just Step One.`
         : `Knowing Your <span class="text-[#d4a853]">IEP Rights</span> Is Just Step One.`;

      return `
         <section class="bp-cta-global py-12 px-4 bg-[#faf6f0]">
            <div class="container mx-auto max-w-4xl">
               <div class="bg-[#1a2744] text-white p-8 md:p-12 rounded-2xl relative overflow-hidden shadow-2xl">
                  <div class="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                     <i class="fa-solid fa-chess-knight absolute -bottom-10 -right-10 text-9xl"></i>
                  </div>
                  
                  <div class="relative z-10 max-w-2xl mx-auto text-center">
                     <span class="inline-block bg-white/10 text-[#d4a853] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Stop Getting Steamrolled</span>
                     
                     <h2 class="text-2xl md:text-3xl font-bold mb-4 font-serif">${stateHeadline}</h2>
                     
                     <p class="text-gray-300 mb-6 text-lg leading-relaxed">
                        Parents in <strong>Texas</strong>, <strong>California</strong>, and <strong>New York</strong> face the same problem: schools know the IEP timeline laws—<em class="text-[#d4a853] not-italic">and exactly how to stall without breaking them.</em>
                     </p>
                     
                     <p class="text-white mb-8 text-xl font-semibold">
                        The <strong class="text-[#d4a853]">IEP Battle Plan</strong> gives you the scripts, data arguments, and live coaching to enforce those deadlines—and win.
                     </p>
                     
                     <a href="/iep/battle-plan/" class="inline-block bg-[#d4a853] text-[#1a2744] font-bold py-4 px-10 rounded-lg hover:bg-[#c29843] transition-all transform hover:scale-105 shadow-lg text-decoration-none text-lg mb-4" data-battle-plan-cta>
                        Get Your Battle Plan — $497
                     </a>
                     
                     <div class="mt-6 text-sm text-gray-400">
                        <a href="/iep/" class="text-gray-400 hover:text-[#d4a853] underline transition-colors">Or browse the free IEP Library first</a>
                     </div>
                  </div>
               </div>
            </div>
         </section>
      `;
   }

   // Inject CTA before footer
   function injectCTA() {
      if (!shouldShowCTA()) return;

      const footer = document.querySelector('footer');
      if (!footer) return;

      const ctaHTML = buildCTA();
      footer.insertAdjacentHTML('beforebegin', ctaHTML);

      // Optional: Add click tracking
      const ctaButton = document.querySelector('[data-battle-plan-cta]');
      if (ctaButton) {
         ctaButton.addEventListener('click', function() {
            // Track with your analytics
            if (typeof gtag !== 'undefined') {
               gtag('event', 'click', {
                  'event_category': 'Battle Plan CTA',
                  'event_label': window.location.pathname
               });
            }
         });
      }
   }

   // Run when DOM is ready
   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectCTA);
   } else {
      injectCTA();
   }
})();
})();
