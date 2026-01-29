/* ============================================
   NAVIGATOR KIDS AI - GLOBAL COMPONENTS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    ensureDependencies();
    injectHeader();
    injectFooter();
    initMobileMenu();
    initFormspree(); // This is the primary handler for all captures
});

// ... (keep ensureDependencies, injectHeader, injectFooter, initMobileMenu)

// 6. FORMSPREE HANDLER
function initFormspree() {
    const FORMSPREE_URL = 'https://formspree.io/f/mnjvvpyj';
    
    // Selects all forms with the data-formspree attribute
    document.querySelectorAll('form[data-formspree]').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn ? btn.innerText : 'Submit';
            if (btn) { btn.disabled = true; btn.innerText = 'Sending...'; }
            
            const formData = new FormData(form);
            formData.append('_source_page', window.location.pathname);
            
            try {
                const res = await fetch(FORMSPREE_URL, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                
                if (res.ok) {
                    // Check for a success message element or redirect
                    const successEl = form.querySelector('.form-success');
                    if (successEl) {
                        form.style.display = 'none';
                        successEl.classList.remove('hidden');
                        successEl.style.display = 'block';
                    } else if (form.dataset.redirect) {
                        window.location.href = form.dataset.redirect;
                    } else {
                        form.innerHTML = '<div style="text-align:center;padding:2rem;"><div style="font-size:2.5rem;margin-bottom:0.5rem;">✅</div><h3 style="margin:0 0 0.5rem;color:#3D405B;">Success!</h3><p style="margin:0;color:#666;">Check your inbox shortly.</p></div>';
                    }
                } else {
                    throw new Error('Submission failed');
                }
            } catch (err) {
                alert('Something went wrong. Please try again or email support@navigatorkids.ai.');
                if (btn) { btn.disabled = false; btn.innerText = originalText; }
            }
        });
    });
}
