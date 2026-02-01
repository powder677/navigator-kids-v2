/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   Status: LAUNCH READY (With IEP Hub Integration)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    ensureDependencies();
    injectHeader();
    injectFooter();
    initMobileMenu();
    initFormspree();
    personalizeSite(); 
    setTimeout(syncCartCount, 500);
});

// 1. DEPENDENCY CHECKER
function ensureDependencies() {
    if (!document.querySelector('script[src*="tailwindcss"]')) {
        const script = document.createElement('script');
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
    }
    
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
        document.head.appendChild(link);
    }
}

// 2. INJECT HEADER
function injectHeader() {
    const headerHTML = `
    <nav class="bg-white shadow-sm fixed top-0 left-0 w-full z-[99999] border-b border-gray-100 h-[76px]" id="navbar">
       <div class="container mx-auto px-4 h-full flex justify-between items-center">
          
          <a href="/" class="flex items-center gap-2 no-underline group hover:opacity-100">
             <span class="text-2xl bg-slate-100 p-2 rounded-lg group-hover:scale-105 transition-transform">🧭</span>
             <span style="font-family: 'Merriweather', serif; font-weight: 700; color: #3D405B; font-size: 1.25rem;">Navigator Kids AI</span>
          </a>

          <div class="hidden md:flex items-center gap-5 lg:gap-6" id="desktopMenu">
             <a href="/quiz/" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline transition">Free Quiz</a>
             <a href="/products/" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline transition">Products</a>
             <a href="/tools/" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline transition">Free Tools</a>
             <a href="/resources/" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline transition">Resources</a>
             <a href="/iep/" class="text-sm font-semibold text-[#3D405B] hover:text-[#E07A5F] no-underline transition bg-[#F9F7F2] px-2 py-1 rounded border border-[#E07A5F]/20">IEP Hub</a>
             <a href="/about/" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline transition">About</a>
             
             <a href="/cart/" class="relative text-gray-600 hover:text-[#E07A5F] no-underline mx-1">
                <i class="fa-solid fa-cart-shopping text-lg"></i>
                <span id="navCartCount" data-count="0" class="absolute -top-2 -right-2 bg-[#E07A5F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style="display:none">0</span>
             </a>
             
             <a href="/quiz/" 
                style="background-color: #E07A5F !important; color: #FFFFFF !important;" 
                class="px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition shadow-md no-underline whitespace-nowrap ml-2">
                Take the Quiz →
             </a>
          </div>

          <button class="md:hidden flex items-center gap-2 text-gray-600 focus:outline-none" id="navToggle" aria-label="Toggle navigation">
             <span class="text-sm font-bold uppercase tracking-wide">Menu</span>
             <i class="fa-solid fa-bars text-2xl"></i>
          </button>
       </div>

       <div class="hidden bg-white border-t border-gray-100 p-4 absolute w-full shadow-xl left-0 top-[76px]" id="mobileMenu">
          <a href="/quiz/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">Free Quiz</a>
          <a href="/products/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">Products</a>
          <a href="/tools/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">Free Tools</a>
          <a href="/resources/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">Resources</a>
          <a href="/iep/" class="block py-3 border-b border-gray-50 text-[#E07A5F] font-bold hover:bg-gray-50 px-2 rounded">IEP Advocacy Hub</a>
          <a href="/about/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">About</a>
          <a href="/contact/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">Contact</a>
          <a href="/cart/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">
             Cart (<span id="mobileCartCount">0</span>)
          </a>
          
          <a href="/quiz/" 
             style="background-color: #E07A5F !important; color: #FFFFFF !important;"
             class="block mt-4 text-center py-3 rounded-lg font-bold no-underline">
             Take the Quiz →
          </a>
       </div>
    </nav>
    <div style="height: 76px; width: 100%;"></div>
    `;

    const placeholder = document.getElementById('header');
    if (placeholder) {
        placeholder.innerHTML = headerHTML;
    } else {
        if(!document.querySelector('nav#navbar')) {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }
}

// 3. INJECT FOOTER
function injectFooter() {
    if(document.querySelector('footer')) return; 

    const footerHTML = `
    <footer class="bg-[#3D405B] text-[#F9F7F2] py-16 mt-auto relative z-10">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                
                <div class="md:col-span-1">
                    <a href="/" class="flex items-center gap-2 mb-4 text-[#F9F7F2] no-underline">
                        <span class="text-2xl">🧭</span>
                        <span class="font-bold text-xl">Navigator Kids AI</span>
                    </a>
                    <p class="text-sm opacity-80 leading-relaxed">Your child's brain didn't come with a manual. Until now.</p>
                    <p class="text-xs opacity-60 mt-3">Tools for parents of twice-exceptional (2e) children ages 6-9.</p>
                </div>
                
                <div>
                    <h4 class="font-bold mb-4 text-[#F9F7F2] text-sm uppercase tracking-wider">Quick Links</h4>
                    <a href="/quiz/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Free Quiz</a>
                    <a href="/free/de-escalation-kit/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Free Regulation Kit</a>
                    <a href="/resources/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Articles</a>
                    <a href="/tools/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Free Tools</a>
                </div>

                <div>
                    <h4 class="font-bold mb-4 text-[#F9F7F2] text-sm uppercase tracking-wider">Advocacy</h4>
                    <a href="/iep/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition text-[#E07A5F] font-semibold">IEP Hub</a>
                    <a href="/iep/states/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">State Laws Map</a>
                    <a href="/iep/iep-meeting-checklist/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Meeting Checklist</a>
                    <a href="/iep/common-school-tactics/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">School Tactics</a>
                </div>
                
                <div>
                    <h4 class="font-bold mb-4 text-[#F9F7F2] text-sm uppercase tracking-wider">Products</h4>
                    <a href="/products/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">All Products</a>
                    <a href="/products/#systems" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Parent Systems</a>
                    <a href="/products/#bundles" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Bundles</a>
                    <a href="/products/#activity-packs" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Activity Packs</a>
                </div>
                
                <div>
                    <h4 class="font-bold mb-4 text-[#F9F7F2] text-sm uppercase tracking-wider">Company</h4>
                    <a href="/about/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">About Us</a>
                    <a href="/contact/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Contact</a>
                    <a href="/terms/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Terms of Service</a>
                    <a href="/privacy/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline transition">Privacy Policy</a>
                </div>
            </div>
            
            <div class="border-t border-[#F9F7F2]/10 pt-8 text-center">
                <p class="text-sm opacity-60 mb-2">&copy; ${new Date().getFullYear()} Navigator Kids AI™. All rights reserved.</p>
                <p class="text-xs opacity-40 max-w-2xl mx-auto leading-relaxed">
                    <strong>Disclaimer:</strong> This website provides educational information for parents. 
                    It is not a substitute for professional medical, psychological, or educational advice, 
                    diagnosis, or treatment. Always seek the advice of qualified professionals.
                </p>
            </div>
        </div>
    </footer>
    `;

    const placeholder = document.getElementById('footer');
    if (placeholder) placeholder.innerHTML = footerHTML;
    else document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// 4. MOBILE MENU
function initMobileMenu() {
    setTimeout(() => {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('mobileMenu');
        
        if (toggle && menu) {
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
            
            newToggle.addEventListener('click', (e) => {
                e.stopPropagation(); 
                menu.classList.toggle('hidden');
                
                const icon = newToggle.querySelector('i');
                if (menu.classList.contains('hidden')) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                } else {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            });
            
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !newToggle.contains(e.target)) {
                    menu.classList.add('hidden');
                    const icon = newToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        }
    }, 200);
}

// 5. CART SYNC
function syncCartCount() {
    let count = 0;
    try {
        if (window.NavigatorCart && typeof window.NavigatorCart.getItemCount === 'function') {
            count = window.NavigatorCart.getItemCount();
        } else {
            const cartData = localStorage.getItem('navigatorCart');
            const cart = cartData ? JSON.parse(cartData) : [];
            count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        }
    } catch(e) { count = 0; }

    const desktopBadge = document.getElementById('navCartCount');
    if (desktopBadge) {
        desktopBadge.innerText = count;
        desktopBadge.dataset.count = count;
        desktopBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    const mobileText = document.getElementById('mobileCartCount');
    if (mobileText) mobileText.innerText = count;
}

window.addEventListener('cartUpdated', syncCartCount);

// 6. FORMSPREE HANDLER
function initFormspree() {
    const FORMSPREE_URL = 'https://formspree.io/f/mnjvvpyj';
    
    document.querySelectorAll('form[data-formspree]').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn ? btn.innerText : 'Submit';
            if (btn) { btn.disabled = true; btn.innerText = 'Sending...'; }
            
            const formData = new FormData(form);
            formData.append('_source', window.location.pathname);
            
            try {
                const res = await fetch(FORMSPREE_URL, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                
                if (res.ok) {
                    const successEl = form.querySelector('.form-success');
                    if (successEl) {
                        form.style.display = 'none';
                        successEl.classList.remove('hidden');
                        successEl.style.display = 'block';
                    } else if (form.dataset.redirect) {
                        window.location.href = form.dataset.redirect;
                    } else {
                        form.innerHTML = '<div style="text-align:center;padding:2rem;"><div style="font-size:2.5rem;margin-bottom:0.5rem;">✅</div><h3 style="margin:0 0 0.5rem;color:#3D405B;">Got it!</h3><p style="margin:0;color:#666;">Check your inbox.</p></div>';
                    }
                } else {
                    throw new Error('Submission failed');
                }
            } catch (err) {
                alert('Something went wrong. Please try again or email us directly.');
                if (btn) { btn.disabled = false; btn.innerText = originalText; }
            }
        });
    });
}

// 7. PERSONALIZATION ENGINE
function personalizeSite() {
    try {
        const data = localStorage.getItem('quizProfile');
        if (!data) return;

        const profile = JSON.parse(data);
        const name = profile.childName || "Your child";

        // 1. Find elements marked for personalization
        document.querySelectorAll('.dynamic-child-name').forEach(el => {
            el.textContent = name;
        });

        // 2. Personalize headers if found
        const heroTitle = document.querySelector('h1 .highlight');
        if (heroTitle && heroTitle.textContent.includes('Child')) {
            heroTitle.textContent = name;
        }

    } catch (e) {
        console.log('Personalization skipped');
    }
}
/* ═══════════════════════════════════════════════════════════════
   IEP BATTLE PLAN — CTA Component
   ═══════════════════════════════════════════════════════════════
   
   INSTRUCTIONS:
   Paste this entire block into the BOTTOM of your existing components.js file.
   It will automatically inject a CTA section before the footer on all /iep/ pages,
   and add a subtle sticky bar at the bottom of the viewport.
   
   To disable on a specific page, add class="no-bp-cta" to the <body> tag.
   To change the offer URL, update the BP_URL constant below.
   ═══════════════════════════════════════════════════════════════ */

(function() {
   'use strict';

   // ── CONFIG ──
   const BP_URL = '/iep/battle-plan/';
   const BP_PRICE = '$497';
   
   // Only show on /iep/ pages (not on the battle plan page itself)
   const currentPath = window.location.pathname;
   if (!currentPath.startsWith('/iep/')) return;
   if (currentPath.includes('/battle-plan')) return;
   if (document.body.classList.contains('no-bp-cta')) return;

   // ── STYLES ──
   const style = document.createElement('style');
   style.textContent = `
      /* ─── Inline CTA Section ─── */
      .bp-inline-cta {
         background: linear-gradient(135deg, #1a2744 0%, #2a3d5e 100%);
         padding: 3rem 1.5rem;
         margin-top: 3rem;
         position: relative;
         overflow: hidden;
      }
      .bp-inline-cta::before {
         content: '';
         position: absolute;
         top: -50%; right: -10%;
         width: 300px; height: 300px;
         background: radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%);
         pointer-events: none;
      }
      .bp-inline-cta-inner {
         max-width: 700px;
         margin: 0 auto;
         display: grid;
         grid-template-columns: 1fr auto;
         gap: 2rem;
         align-items: center;
         position: relative;
         z-index: 1;
      }
      @media (max-width: 640px) {
         .bp-inline-cta-inner {
            grid-template-columns: 1fr;
            text-align: center;
         }
      }
      .bp-inline-cta-text h3 {
         font-family: 'Merriweather', serif;
         font-size: 1.25rem;
         font-weight: 700;
         color: #ffffff;
         margin: 0 0 0.5rem;
         line-height: 1.35;
      }
      .bp-inline-cta-text p {
         font-family: 'Inter', sans-serif;
         font-size: 0.88rem;
         color: rgba(255,255,255,0.65);
         margin: 0;
         line-height: 1.6;
      }
      .bp-inline-cta-btn {
         display: inline-block;
         background: #d4a853;
         color: #1a2744;
         font-family: 'Inter', sans-serif;
         font-weight: 700;
         font-size: 0.92rem;
         padding: 0.85rem 1.75rem;
         border-radius: 8px;
         text-decoration: none;
         white-space: nowrap;
         transition: all 0.2s ease;
         box-shadow: 0 3px 15px rgba(212,168,83,0.25);
      }
      .bp-inline-cta-btn:hover {
         transform: translateY(-1px);
         box-shadow: 0 5px 22px rgba(212,168,83,0.4);
      }
      .bp-inline-cta-btn span {
         display: block;
         font-size: 0.72rem;
         font-weight: 500;
         opacity: 0.7;
         margin-top: 0.15rem;
      }

      /* ─── Sticky Bottom Bar ─── */
      .bp-sticky-bar {
         position: fixed;
         bottom: 0;
         left: 0;
         right: 0;
         background: #1a2744;
         padding: 0.65rem 1.5rem;
         display: flex;
         justify-content: center;
         align-items: center;
         gap: 1rem;
         z-index: 9999;
         transform: translateY(100%);
         transition: transform 0.4s ease;
         box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
      }
      .bp-sticky-bar.visible {
         transform: translateY(0);
      }
      .bp-sticky-bar p {
         font-family: 'Inter', sans-serif;
         font-size: 0.82rem;
         color: rgba(255,255,255,0.8);
         margin: 0;
      }
      .bp-sticky-bar p strong {
         color: #d4a853;
      }
      .bp-sticky-bar a {
         display: inline-block;
         background: #d4a853;
         color: #1a2744;
         font-family: 'Inter', sans-serif;
         font-weight: 700;
         font-size: 0.78rem;
         padding: 0.45rem 1.1rem;
         border-radius: 6px;
         text-decoration: none;
         white-space: nowrap;
         transition: opacity 0.2s;
      }
      .bp-sticky-bar a:hover { opacity: 0.9; }
      .bp-sticky-close {
         background: none;
         border: none;
         color: rgba(255,255,255,0.4);
         font-size: 1.1rem;
         cursor: pointer;
         padding: 0 0.25rem;
         line-height: 1;
      }
      .bp-sticky-close:hover { color: rgba(255,255,255,0.7); }
      @media (max-width: 500px) {
         .bp-sticky-bar p { display: none; }
         .bp-sticky-bar { justify-content: center; }
         .bp-sticky-bar a { font-size: 0.82rem; padding: 0.5rem 1.5rem; }
      }

      /* Push footer content up so sticky bar doesn't cover it */
      body.bp-bar-active { padding-bottom: 50px; }
   `;
   document.head.appendChild(style);

   // ── INLINE CTA (before footer) ──
   function injectInlineCTA() {
      const footer = document.getElementById('footer');
      if (!footer) return;

      const cta = document.createElement('section');
      cta.className = 'bp-inline-cta';
      cta.setAttribute('aria-label', 'IEP Battle Plan offer');
      cta.innerHTML = `
         <div class="bp-inline-cta-inner">
            <div class="bp-inline-cta-text">
               <h3>Stop Googling. Start Strategizing.</h3>
               <p>The IEP Battle Plan gives you a personalized heat map, meeting script, pre-written emails, and a live strategy call—so you walk in prepared, not panicked.</p>
            </div>
            <a href="${BP_URL}" class="bp-inline-cta-btn">
               Get Your Battle Plan
               <span>Starts at ${BP_PRICE}</span>
            </a>
         </div>
      `;

      footer.parentNode.insertBefore(cta, footer);
   }

   // ── STICKY BAR ──
   function injectStickyBar() {
      // Don't show if user dismissed it this session
      if (sessionStorage.getItem('bp-bar-dismissed')) return;

      const bar = document.createElement('div');
      bar.className = 'bp-sticky-bar';
      bar.setAttribute('role', 'complementary');
      bar.setAttribute('aria-label', 'IEP Battle Plan');
      bar.innerHTML = `
         <p>IEP meeting coming up? <strong>Get your personalized Battle Plan.</strong></p>
         <a href="${BP_URL}">Learn More →</a>
         <button class="bp-sticky-close" aria-label="Dismiss">&times;</button>
      `;
      document.body.appendChild(bar);

      // Show after user scrolls 40% of the page
      let shown = false;
      function checkScroll() {
         const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
         if (scrollPercent > 0.35 && !shown) {
            bar.classList.add('visible');
            document.body.classList.add('bp-bar-active');
            shown = true;
         }
      }
      window.addEventListener('scroll', checkScroll, { passive: true });
      // Also check immediately in case page is already scrolled
      checkScroll();

      // Close button
      bar.querySelector('.bp-sticky-close').addEventListener('click', () => {
         bar.classList.remove('visible');
         document.body.classList.remove('bp-bar-active');
         sessionStorage.setItem('bp-bar-dismissed', '1');
      });
   }

   // ── INIT ──
   // Wait for DOM to be ready (components.js may load deferred)
   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
         // Small delay to let header/footer components render first
         setTimeout(() => {
            injectInlineCTA();
            injectStickyBar();
         }, 100);
      });
   } else {
      setTimeout(() => {
         injectInlineCTA();
         injectStickyBar();
      }, 100);
   }

})();
