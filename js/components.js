/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   Status: FIXED (White Button & Reliable Nav)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    initMobileMenu();
    setTimeout(syncCartCount, 100);
});

// 1. INJECT HEADER (Fixed Positioning + Color Override)
function injectHeader() {
    const headerHTML = `
    <nav class="bg-white shadow-sm fixed top-0 left-0 w-full z-[9999] border-b border-gray-100" id="navbar">
       <div class="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          
          <a href="/" class="flex items-center gap-2 no-underline group">
             <span class="text-2xl bg-slate-100 p-2 rounded-lg group-hover:scale-105 transition-transform">🧭</span>
             <span style="font-family: 'Merriweather', serif; font-weight: 700; color: #3D405B; font-size: 1.25rem;">Navigator Kids AI</span>
          </a>

          <div class="hidden md:flex items-center gap-8 nav-links">
             <a href="/#profiles" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline">Brain Profiles</a>
             <a href="/tools/iep-advocate/" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline">IEP Tool</a>
             <a href="/resources/" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline">Resources</a>
             
             <a href="/cart/" class="relative text-gray-600 hover:text-[#E07A5F] no-underline">
                <i class="fa-solid fa-cart-shopping text-lg"></i>
                <span id="navCartCount" data-count="0" class="absolute -top-2 -right-2 bg-[#E07A5F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style="display:none">0</span>
             </a>
             
             <a href="/quiz/" 
                style="background-color: #3D405B !important; color: #FFFFFF !important;" 
                class="px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition shadow-md no-underline flex items-center">
                Take the Quiz
             </a>
          </div>

          <button class="md:hidden text-gray-600 text-2xl focus:outline-none" id="navToggle" aria-label="Toggle navigation">
             <i class="fa-solid fa-bars"></i>
          </button>
       </div>

       <div class="hidden bg-white border-t border-gray-100 p-4 absolute w-full shadow-lg left-0 top-full" id="mobileMenu">
          <a href="/quiz/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium">Free Quiz</a>
          <a href="/tools/iep-advocate/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium">IEP Tool</a>
          <a href="/resources/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium">Resources</a>
          <a href="/cart/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium">Cart (<span id="mobileCartCount">0</span>)</a>
          
          <a href="/quiz/" 
             style="background-color: #3D405B !important; color: #FFFFFF !important;"
             class="block mt-4 text-center py-3 rounded-lg font-bold">
             Take Quiz
          </a>
       </div>
    </nav>
    <div style="height: 76px;"></div>
    `;

    const placeholder = document.getElementById('header');
    if (placeholder) {
        placeholder.innerHTML = headerHTML;
    } else {
        if(!document.querySelector('nav')) {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }
}

// 2. INJECT FOOTER
function injectFooter() {
    if(document.querySelector('footer')) return; 

    const footerHTML = `
    <footer class="bg-[#3D405B] text-[#F9F7F2] py-12 mt-auto">
        <div class="container mx-auto px-4">
            <div class="flex flex-wrap justify-between gap-8 mb-8">
                <div class="w-full md:w-1/3">
                    <a href="/" class="flex items-center gap-2 mb-3 text-[#F9F7F2] no-underline">
                        <span class="text-2xl">🧭</span>
                        <span class="font-bold text-xl">Navigator Kids AI</span>
                    </a>
                    <p class="text-sm opacity-80 max-w-xs leading-relaxed">Neuroscience-backed tools for the "spicy" brains we love.</p>
                </div>
                <div>
                    <h4 class="font-bold mb-4 text-[#F9F7F2]">Resources</h4>
                    <a href="/quiz/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline">Free Quiz</a>
                    <a href="/tools/iep-advocate/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline">IEP Tool</a>
                    <a href="/resources/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline">Articles</a>
                </div>
                <div>
                    <h4 class="font-bold mb-4 text-[#F9F7F2]">Support</h4>
                    <a href="/contact/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline">Contact</a>
                    <a href="/privacy/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline">Privacy</a>
                    <a href="/terms/" class="block text-sm opacity-70 hover:opacity-100 mb-2 no-underline">Terms</a>
                </div>
            </div>
            <div class="border-t border-[#F9F7F2]/10 pt-8 text-center text-xs opacity-60">
                <p>&copy; ${new Date().getFullYear()} Navigator Kids AI. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
    `;

    const placeholder = document.getElementById('footer');
    if (placeholder) placeholder.innerHTML = footerHTML;
    else document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// 3. MOBILE MENU (Enhanced Robustness)
function initMobileMenu() {
    // Use timeout to ensure DOM injection is complete
    setTimeout(() => {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('mobileMenu');
        
        if (toggle && menu) {
            // Remove old listeners by cloning (optional but safe)
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
            
            newToggle.addEventListener('click', (e) => {
                e.stopPropagation(); 
                menu.classList.toggle('hidden');
            });
            
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !newToggle.contains(e.target)) {
                    menu.classList.add('hidden');
                }
            });
        }
    }, 100);
}

// 4. CART SYNC
function syncCartCount() {
    let count = 0;
    if (window.NavigatorCart && typeof window.NavigatorCart.getItemCount === 'function') {
        count = window.NavigatorCart.getItemCount();
    } else {
        try {
            const cartData = localStorage.getItem('navigatorCart');
            const cart = cartData ? JSON.parse(cartData) : [];
            count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        } catch(e) { count = 0; }
    }

    const desktopBadge = document.getElementById('navCartCount');
    if (desktopBadge) {
        desktopBadge.innerText = count;
        desktopBadge.setAttribute('data-count', count);
        desktopBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    const mobileText = document.getElementById('mobileCartCount');
    if (mobileText) mobileText.innerText = count;
}

window.addEventListener('cartUpdated', syncCartCount);
