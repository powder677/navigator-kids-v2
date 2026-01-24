/* ============================================
   NAVIGATOR KIDS AI - FORM HANDLER
   form-handler.js - Google Sheets integration
   ============================================ */

(function() {
    'use strict';

    // =========================================
    // CONFIGURATION
    // =========================================
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzFE_cy1N0eThZRwjzjyc4_MEGefjzjnTIgWHj_eIZFd-m4Ru0N84FM68fpcmgxr2s3Ig/exec';

    // =========================================
    // FORM SUBMISSION HANDLER
    // =========================================
    
    /**
     * Submit form data to Google Sheets
     * @param {Object} data - Form data to submit
     * @param {string} data.email - Required: email address
     * @param {string} data.source - Required: form identifier (e.g., 'quiz', 'de-escalation-kit', 'newsletter')
     * @param {string} [data.name] - Optional: name
     * @param {string} [data.childName] - Optional: child's name
     * @param {string} [data.profile] - Optional: quiz result profile
     * @param {Object} [data.extra] - Optional: any additional data
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async function submitToGoogleSheets(data) {
        // Validate required fields
        if (!data.email) {
            return { success: false, message: 'Email is required' };
        }
        if (!data.source) {
            return { success: false, message: 'Source identifier is required' };
        }

        // Validate email format
        if (!isValidEmail(data.email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        // Prepare payload
        const payload = {
            timestamp: new Date().toISOString(),
            email: data.email.toLowerCase().trim(),
            source: data.source,
            name: data.name || '',
            childName: data.childName || '',
            profile: data.profile || '',
            extra: data.extra ? JSON.stringify(data.extra) : '',
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        try {
            // Submit to Google Apps Script
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            // Note: With 'no-cors', we can't read the response
            // We assume success if no error was thrown
            console.log('Form submitted successfully:', payload.email, payload.source);
            
            // Track event if analytics available
            if (typeof trackEvent === 'function') {
                trackEvent('Form', 'Submit', data.source);
            }

            return { success: true, message: 'Submitted successfully!' };

        } catch (error) {
            console.error('Form submission error:', error);
            
            // Track error
            if (typeof trackEvent === 'function') {
                trackEvent('Form', 'Error', data.source);
            }

            return { success: false, message: 'Submission failed. Please try again.' };
        }
    }

    /**
     * Validate email format
     * @param {string} email 
     * @returns {boolean}
     */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // =========================================
    // FORM UI HELPERS
    // =========================================

    /**
     * Show loading state on a button
     * @param {HTMLElement} button 
     * @param {string} [loadingText='Submitting...']
     */
    function setButtonLoading(button, loadingText = 'Submitting...') {
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.disabled = true;
        button.classList.add('loading');
    }

    /**
     * Reset button from loading state
     * @param {HTMLElement} button 
     */
    function resetButton(button) {
        button.textContent = button.dataset.originalText || 'Submit';
        button.disabled = false;
        button.classList.remove('loading');
    }

    /**
     * Show success message
     * @param {HTMLElement} formContainer - Container to show message in
     * @param {string} [message='Thanks! Check your email.']
     */
    function showSuccessMessage(formContainer, message = 'Thanks! Check your email.') {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success-message';
        successDiv.innerHTML = `
            <div class="success-icon">✓</div>
            <p>${message}</p>
        `;
        
        // Add styles if not present
        addSuccessStyles();
        
        // Replace form content
        formContainer.innerHTML = '';
        formContainer.appendChild(successDiv);
    }

    /**
     * Show error message
     * @param {HTMLElement} container - Where to show error
     * @param {string} message 
     */
    function showErrorMessage(container, message) {
        // Remove existing error
        const existing = container.querySelector('.form-error-message');
        if (existing) existing.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.textContent = message;
        
        container.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    /**
     * Add success message styles to page
     */
    function addSuccessStyles() {
        if (document.getElementById('form-handler-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'form-handler-styles';
        styles.textContent = `
            .form-success-message {
                text-align: center;
                padding: 2rem;
            }
            .form-success-message .success-icon {
                width: 64px;
                height: 64px;
                background: #22C55E;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                margin: 0 auto 1rem;
            }
            .form-success-message p {
                font-size: 1.125rem;
                color: #374151;
            }
            .form-error-message {
                background: #FEE2E2;
                color: #DC2626;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                font-size: 0.875rem;
                margin-top: 1rem;
            }
            .btn.loading {
                opacity: 0.7;
                cursor: wait;
            }
        `;
        document.head.appendChild(styles);
    }

    // =========================================
    // QUICK FORM SETUP
    // =========================================

    /**
     * Quickly set up a simple email capture form
     * @param {Object} options
     * @param {string} options.formId - ID of the form element
     * @param {string} options.emailInputId - ID of the email input
     * @param {string} options.source - Source identifier for tracking
     * @param {string} [options.nameInputId] - Optional: ID of name input
     * @param {string} [options.successMessage] - Custom success message
     * @param {Function} [options.onSuccess] - Callback on success
     */
    function setupEmailForm(options) {
        const form = document.getElementById(options.formId);
        if (!form) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            const emailInput = document.getElementById(options.emailInputId);
            const submitBtn = form.querySelector('button[type="submit"]');
            
            if (!emailInput || !submitBtn) return;

            // Get form data
            const data = {
                email: emailInput.value,
                source: options.source
            };

            // Get optional name
            if (options.nameInputId) {
                const nameInput = document.getElementById(options.nameInputId);
                if (nameInput) data.name = nameInput.value;
            }

            // Show loading
            setButtonLoading(submitBtn, 'Sending...');

            // Submit
            const result = await submitToGoogleSheets(data);

            if (result.success) {
                // Show success
                const formContainer = form.closest('.signup-form') || form.parentElement;
                showSuccessMessage(formContainer, options.successMessage || 'Thanks! Check your inbox.');
                
                // Callback
                if (options.onSuccess) options.onSuccess(data);
            } else {
                // Show error
                resetButton(submitBtn);
                showErrorMessage(form, result.message);
            }
        });
    }

    // =========================================
    // PUBLIC API
    // =========================================
    window.NavigatorForms = {
        submit: submitToGoogleSheets,
        setupEmailForm: setupEmailForm,
        setButtonLoading: setButtonLoading,
        resetButton: resetButton,
        showSuccessMessage: showSuccessMessage,
        showErrorMessage: showErrorMessage,
        isValidEmail: isValidEmail
    };

})();
