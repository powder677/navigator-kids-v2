/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   Status: BULLETPROOF (Auto-loads styles & dependencies)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    ensureDependencies(); // 1. Load Tailwind/Icons if missing
    injectHeader();       // 2. Build Header
    injectFooter();       // 3. Build Footer
    initMobileMenu();     // 4. Activate Buttons
    setTimeout(syncCartCount, 500);
});

// 1. DEPENDENCY CHECKER (Self-Repairing)
function ensureDependencies() {
    // Check for Tailwind
    if (!document.querySelector('script[src*="tailwindcss"]')) {
        const script = document.createElement('script');
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
    }
    
    // Check for FontAwesome
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

          <div class="hidden md:flex items-center gap-6 lg:gap-8" id="desktopMenu">
             <a href="/#profiles" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline">Brain Profiles</a>
             <a href="/tools/iep-advocate/" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline">IEP Tool</a>
             <a href="/resources/" class="text-sm font-semibold text-gray-600 hover:text-[#81B29A] no-underline">Resources</a>
             
             <a href="/cart/" class="relative text-gray-600 hover:text-[#E07A5F] no-underline mx-2">
                <i class="fa-solid fa-cart-shopping text-lg"></i>
                <span id="navCartCount" data-count="0" class="absolute -top-2 -right-2 bg-[#E07A5F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style="display:none">0</span>
             </a>
             
             <a href="/quiz/" 
                style="background-color: #3D405B !important; color: #FFFFFF !important;" 
                class="px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition shadow-md no-underline whitespace-nowrap">
                Take the Quiz
             </a>
          </div>

          <button class="md:hidden flex items-center gap-2 text-gray-600 focus:outline-none" id="navToggle" aria-label="Toggle navigation">
             <span class="text-sm font-bold uppercase tracking-wide">Menu</span>
             <i class="fa-solid fa-bars text-2xl"></i>
          </button>
       </div>

       <div class="hidden bg-white border-t border-gray-100 p-4 absolute w-full shadow-xl left-0 top-[76px]" id="mobileMenu">
          <a href="/quiz/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">Free Quiz</a>
          <a href="/tools/iep-advocate/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">IEP Tool</a>
          <a href="/resources/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">Resources</a>
          <a href="/cart/" class="block py-3 border-b border-gray-50 text-gray-600 font-medium hover:bg-gray-50 px-2 rounded">Cart (<span id="mobileCartCount">0</span>)</a>
          
          <a href="/quiz/" 
             style="background-color: #3D405B !important; color: #FFFFFF !important;"
             class="block mt-4 text-center py-3 rounded-lg font-bold">
             Take Quiz
          </a>
       </div>
    </nav>
    <div style="height: 76px; width: 100%;"></div>
    `;

    // Inject Logic
    const placeholder = document.getElementById('header');
    if (placeholder) {
        placeholder.innerHTML = headerHTML;
    } else {
        // Fallback: Inject at start of body if no placeholder exists
        if(!document.querySelector('nav#navbar')) {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }
}

// 3. INJECT FOOTER
function injectFooter() {
    if(document.querySelector('footer')) return; 

    const footerHTML = `
    <footer class="bg-[#3D405B] text-[#F9F7F2] py-12 mt-auto relative z-10">
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

// 4. MOBILE MENU
function initMobileMenu() {
    setTimeout(() => {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('mobileMenu');
        
        if (toggle && menu) {
            // Clone to remove old listeners
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
        desktopBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    const mobileText = document.getElementById('mobileCartCount');
    if (mobileText) mobileText.innerText = count;
}

window.addEventListener('cartUpdated', syncCartCount);
