// js/cart.js

// Function to add item to cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        // If strict quantity limit (like 1 per digital item), do nothing or alert
        // For now, let's assume quantity isn't relevant for digital downloads, or just ignore duplicates
        alert("This item is already in your cart!");
        return; 
    } else {
        cart.push(product);
        
        // Show success feedback
        showToast(`Added ${product.name} to cart!`);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Function to update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countElements = document.querySelectorAll('#cart-count');
    
    countElements.forEach(el => {
        el.innerText = cart.length;
        // Make it bounce/animate
        el.classList.add('animate-bounce');
        setTimeout(() => el.classList.remove('animate-bounce'), 1000);
    });
}

// Toast notification helper
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = "fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-20 z-50 flex items-center gap-3";
    toast.innerHTML = `<i class="fa-solid fa-check-circle text-[#4ECDC4]"></i> <span>${message}</span>`;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-20');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize count on load
document.addEventListener('DOMContentLoaded', updateCartCount);
