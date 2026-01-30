/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   Status: LAUNCH READY
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    ensureDependencies();
    injectHeader();
    injectFooter();
    initMobileMenu();
    initFormspree();
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
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                
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
