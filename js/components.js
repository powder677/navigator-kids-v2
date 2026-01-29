/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   Status: FIXED (Uses Tailwind Classes for Consistency)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    initMobileMenu();
    
    // Delayed sync to ensure cart is ready
    setTimeout(syncCartCount, 100);
    setActiveLink();
});

// 1. INJECT HEADER (Using Tailwind Classes)
function injectHeader() {
    const headerHTML = `
    <nav class="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100 font-sans">
        <div class="container mx-auto px-4 py-3">
            <div class="flex justify-between items-center">
                
                <a href="/" class="flex items-center gap-2 hover:opacity-80 transition group">
                    <span class="text-3xl transform group-hover:scale-110 transition">🧭</span>
                    <span class="font-bold text-xl text-gray-800 tracking-tight">Navigator Kids</span>
                </a>

                <div class="hidden md:flex items-center gap-8 font-medium text-gray-600">
                    <a href="/quiz/" class="hover:text-[#FF6B6B] transition">Brain Quiz</a>
                    <a href="/products/" class="hover:text-[#FF6B6B] transition">Shop Tools</a>
                    <a href="/resources/" class="hover:text-[#FF6B6B] transition">Resources</a>
                    <a href="/about/" class="hover:text-[#FF6B6B] transition">About</a>
                </div>

                <div class="flex items-center gap-6">
                    <a href="/cart/" class="relative hover:text-[#FF6B6B] transition group">
                        <i class="fa-solid fa-cart-shopping text-xl"></i>
                        <span id="nav-cart-count" class="absolute -top-2 -right-2 bg-[#FF6B6B] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center transform group-hover:scale-110 transition" style="display:none">0</span>
                    </a>
                    
                    <button id="navToggle" class="md:hidden text-2xl text-gray-600 focus:outline-none">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>
            </div>

            <div id="mobileMenu" class="hidden md:hidden pt-4 pb-4 border-t border-gray-100 mt-3 space-y-2 bg-white">
                <a href="/quiz/" class="block py-2 px-4 rounded hover:bg-gray-50 text-gray-700">Free Brain Quiz</a>
                <a href="/products/" class="block py-2 px-4 rounded hover:bg-gray-50 text-[#FF6B6B] font-bold">Shop Tools</a>
                <a href="/resources/" class="block py-2 px-4 rounded hover:bg-gray-50 text-gray-700">Resources</a>
                <a href="/about/" class="block py-2 px-4 rounded hover:bg-gray-50 text-gray-700">About</a>
                <a href="/cart/" class="block py-2 px-4 rounded hover:bg-gray-50 text-gray-700">
                    Cart (<span id="mobileCartCount">0</span>)
                </a>
            </div>
        </div>
    </nav>
    `;

    // Inject into placeholder
    const placeholder = document.getElementById('header');
    if (placeholder) {
        placeholder.innerHTML = headerHTML;
    } else {
        // Fallback: Prepend to body if placeholder is missing
        const existingNav = document.querySelector('nav');
        if (existingNav) existingNav.remove(); 
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }
}

// 2. INJECT FOOTER (Using Tailwind Classes)
function injectFooter() {
    const footerHTML = `
    <footer class="bg-[#2D3748] text-white pt-16 pb-8 mt-auto border-t border-gray-200">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div class="col-span-1">
                    <div class="flex items-center gap-2 mb-4">
                        <span class="text-3xl">🧭</span>
                        <span class="font-bold text-xl">Navigator Kids</span>
                    </div>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        Neuroscience-backed tools for the "spicy" brains we love.
                    </p>
                </div>

                <div>
                    <h4 class="font-bold mb-6 text-[#FF6B6B]">Shop</h4>
                    <ul class="space-y-3 text-sm text-gray-300">
                        <li><a href="/products/" class="hover:text-white transition">All Tools</a></li>
                        <li><a href="/cart/" class="hover:text-white transition">My Cart</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold mb-6 text-[#4ECDC4]">Resources</h4>
                    <ul class="space-y-3 text-sm text-gray-300">
                        <li><a href="/quiz/" class="hover:text-white transition">Free Brain Quiz</a></li>
                        <li><a href="/resources/" class="hover:text-white transition">Parent Articles</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold mb-6 text-[#FFE66D]">Support</h4>
                    <ul class="space-y-3 text-sm text-gray-300">
                        <li><a href="/contact/" class="hover:text-white transition">Contact Us</a></li>
                        <li><a href="/privacy/" class="hover:text-white transition">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t border-gray-700 pt-8 text-center text-gray-500 text-xs">
                <p>&copy; ${new Date().getFullYear()} Navigator Kids AI. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
    `;

    const placeholder = document.getElementById('footer');
    if (placeholder) {
        placeholder.innerHTML = footerHTML;
    } else if (!document.querySelector('footer')) {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
}

// 3. UTILITIES (Mobile Toggle, Cart Sync, Active State)
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');

    if (toggle && menu) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    }
}

function syncCartCount() {
    let count = 0;
    
    // 1. Try Cart API
    if (window.NavigatorCart && typeof window.NavigatorCart.getItemCount === 'function') {
        count = window.NavigatorCart.getItemCount();
    } 
    // 2. Fallback to storage
    else {
        try {
            const data = JSON.parse(localStorage.getItem('navigatorCart') || '[]');
            count = data.reduce((sum, item) => sum + (item.quantity || 1), 0);
        } catch(e) { count = 0; }
    }

    // Update UI
    const badge = document.getElementById('nav-cart-count');
    if (badge) {
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
    
    const mobileCount = document.getElementById('mobileCartCount');
    if (mobileCount) mobileCount.innerText = count;
}

window.addEventListener('cartUpdated', syncCartCount);

function setActiveLink() {
    const path = window.location.pathname;
    // Normalize path (remove trailing slash for comparison if needed)
    const links = document.querySelectorAll('nav a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        // Exact match or sub-path match
        if (href === path || (href !== '/' && path.startsWith(href))) {
            link.classList.add('text-[#FF6B6B]', 'font-bold');
            link.classList.remove('text-gray-600');
        }
    });
}
