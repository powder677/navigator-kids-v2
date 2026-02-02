/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   Status: FIXED (Uses Custom Header/Footer + IEP Links)
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
    // 1. Load Tailwind (Utility classes)
    if (!document.querySelector('script[src*="tailwindcss"]')) {
        const script = document.createElement('script');
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
    }
    
    // 2. Load FontAwesome (Icons)
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
        document.head.appendChild(link);
    }

    // 3. Load Main Styles (CRITICAL: Ensures header/footer look right on all pages)
    if (!document.querySelector('link[href*="/css/styles.css"]')) {
        const link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = "/css/styles.css";
        document.head.appendChild(link);
    }
}

// 2. INJECT HEADER (Your Custom Design)
function injectHeader() {
    const headerHTML = `
    <nav class="navbar" id="navbar">
       <div class="container nav-content">
          <a href="/" class="logo">
             <span class="logo-icon">🧒</span>
             Navigator Kids AI
          </a>
    
          <div class="nav-links" id="navLinks">
             <a href="/quiz/">Free Quiz</a>
             <a href="/resources/">Resources</a>
             <a href="/products/">Products</a>
             <a href="/tools/">Free Tools</a>
             <a href="/iep/" style="color:#E07A5F; font-weight:700;">IEP Hub</a>
             
             <a href="/cart/" class="nav-cart" id="navCart" title="Shopping Cart">
                🛒
                <span class="nav-cart-count cart-count" id="navCartCount">0</span>
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
          <a href="/products/">Products</a>
          <a href="/tools/">Free Tools</a>
          <a href="/iep/" style="color:#E07A5F;">IEP Advocacy Hub</a>
          <a href="/about/">About</a>
          <a href="/cart/">Cart (<span class="mobile-cart-count cart-count">0</span>)</a>
          <a href="/quiz/" class="btn btn-primary">Take the Quiz</a>
       </div>
    </nav>
    <div style="height: 80px;"></div>
    `;

    const placeholder = document.getElementById('header');
    if (placeholder) {
        placeholder.innerHTML = headerHTML;
        placeholder.classList.add('loaded');
    } else {
        if(!document.querySelector('nav#navbar')) {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }
}

// 3. INJECT FOOTER (Your Custom Design)
function injectFooter() {
    if(document.querySelector('footer')) return; 

    const footerHTML = `
    <footer class="footer">
       <div class="container">
          <div class="footer-content">
             <div class="footer-brand">
                <a href="/" class="logo">
                   <span class="logo-icon">🧒</span>
                   Navigator Kids AI
                </a>
                <p>Your child's brain didn't come with a manual. Until now.</p>
                <p style="margin-top: 1rem; font-size: 0.75rem; opacity: 0.6;">
                   Tools for parents of twice-exceptional (2e) children ages 6-9.
                </p>
             </div>
    
             <div class="footer-links">
                <h4>Quick Links</h4>
                <a href="/quiz/">Free Quiz</a>
                <a href="/iep/">IEP Advocacy Hub</a>
                <a href="/free/de-escalation-kit/">Free Regulation Kit</a>
                <a href="/resources/">Articles</a>
                <a href="/tools/">Free Tools</a>
             </div>
    
             <div class="footer-links">
                <h4>Products</h4>
                <a href="/products/">All Products</a>
                <a href="/products/#ai-prompts">AI Prompt Packs</a>
                <a href="/products/#activity-packets">Activity Packets</a>
             </div>
    
             <div class="footer-links">
                <h4>Company</h4>
                <a href="/about/">About Us</a>
                <a href="/contact/">Contact</a>
                <a href="/terms/">Terms of Service</a>
                <a href="/privacy/">Privacy Policy</a>
             </div>
          </div>
    
          <div class="footer-bottom">
             <p>© ${new Date().getFullYear()} Navigator Kids AI™. All rights reserved.</p>
             <p class="footer-disclaimer">
                <strong>Disclaimer:</strong> This website provides educational information for parents.
                It is not a substitute for professional medical, psychological, or educational advice.
             </p>
          </div>
       </div>
    </footer>
    `;

    const placeholder = document.getElementById('footer');
    if (placeholder) placeholder.innerHTML = footerHTML;
    else document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// 4. MOBILE MENU (Fixed for Custom Header)
function initMobileMenu() {
    setTimeout(() => {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('mobileMenu');
        
        if (toggle && menu) {
            // Clone to remove old event listeners if any
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
            
            newToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                // Toggle 'active' class for CSS styling (transform burger to X, slide in menu)
                newToggle.classList.toggle('active');
                menu.classList.toggle('active');
                
                const isExpanded = newToggle.classList.contains('active');
                newToggle.setAttribute('aria-expanded', isExpanded);
            });
            
            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !newToggle.contains(e.target)) {
                    newToggle.classList.remove('active');
                    menu.classList.remove('active');
                    newToggle.setAttribute('aria-expanded', 'false');
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

    // Update ALL cart counters (desktop and mobile)
    document.querySelectorAll('.cart-count').forEach(el => {
        el.innerText = count;
        el.style.display = count > 0 ? 'flex' : 'none'; // Flex for badge layout
    });
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
                    if (form.dataset.download) {
                        var dlLink = document.createElement('a');
                        dlLink.href = form.dataset.download;
                        dlLink.download = '';
                        document.body.appendChild(dlLink);
                        dlLink.click();
                        document.body.removeChild(dlLink);
                    }

                    const successEl = form.querySelector('.form-success');
                    if (successEl) {
                        form.style.display = 'none';
                        successEl.classList.remove('hidden');
                        successEl.style.display = 'block';
                    } else if (form.dataset.redirect) {
                        window.location.href = form.dataset.redirect;
                    }
                } else {
                    throw new Error('Submission failed');
                }
            } catch (err) {
                alert('Something went wrong. Please try again.');
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
        document.querySelectorAll('.dynamic-child-name').forEach(el => {
            el.textContent = name;
        });
    } catch (e) {}
}

/* ═══════════════════════════════════════════════════════════════
   IEP BATTLE PLAN CTA (Preserved)
   ═══════════════════════════════════════════════════════════════ */
(function() {
   'use strict';
   const BP_URL = '/iep/';
   const BP_PRICE = '$497';
   const currentPath = window.location.pathname;
   
   if (!currentPath.startsWith('/iep/')) return;
   if (currentPath.includes('/battle-plan')) return;
   if (document.body.classList.contains('no-bp-cta')) return;
   if (currentPath === '/iep/' || currentPath === '/iep/index.html') return;

   const style = document.createElement('style');
   style.textContent = `
      .bp-inline-cta { background: linear-gradient(135deg, #1a2744 0%, #2a3d5e 100%); padding: 3rem 1.5rem; margin-top: 3rem; position: relative; overflow: hidden; }
      .bp-inline-cta-inner { max-width: 700px; margin: 0 auto; display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: center; position: relative; z-index: 1; }
      .bp-inline-cta-text h3 { font-family: 'Merriweather', serif; font-size: 1.25rem; font-weight: 700; color: #ffffff; margin: 0 0 0.5rem; }
      .bp-inline-cta-text p { font-family: 'Inter', sans-serif; font-size: 0.88rem; color: rgba(255,255,255,0.65); margin: 0; }
      .bp-inline-cta-btn { display: inline-block; background: #d4a853; color: #1a2744; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.92rem; padding: 0.85rem 1.75rem; border-radius: 8px; text-decoration: none; box-shadow: 0 3px 15px rgba(212,168,83,0.25); }
      @media (max-width: 640px) { .bp-inline-cta-inner { grid-template-columns: 1fr; text-align: center; } }
   `;
   document.head.appendChild(style);

   function injectInlineCTA() {
      const footer = document.getElementById('footer');
      if (!footer) return;
      const cta = document.createElement('section');
      cta.className = 'bp-inline-cta';
      cta.innerHTML = `
         <div class="bp-inline-cta-inner">
            <div class="bp-inline-cta-text">
               <h3>Stop Googling. Start Strategizing.</h3>
               <p>The IEP Battle Plan gives you a personalized heat map, meeting script, and strategy call.</p>
            </div>
            <a href="${BP_URL}" class="bp-inline-cta-btn">Get Your Battle Plan</a>
         </div>
      `;
      footer.parentNode.insertBefore(cta, footer);
   }

   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(injectInlineCTA, 100));
   } else {
      setTimeout(injectInlineCTA, 100);
   }
})();
