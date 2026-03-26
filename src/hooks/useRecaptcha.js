import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for Google reCAPTCHA v3 integration.
 * Loads the reCAPTCHA script and provides a function to execute and get tokens.
 * 
 * @returns {Object} - { executeRecaptcha, isReady }
 */
const useRecaptcha = () => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const isReady = useRef(false);

    useEffect(() => {
        if (!siteKey) {
            console.warn('reCAPTCHA site key is missing. Please add VITE_RECAPTCHA_SITE_KEY to your .env file.');
            return;
        }

        // Check if script is already loaded
        if (window.grecaptcha) {
            isReady.current = true;
            return;
        }

        // Load reCAPTCHA script
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            window.grecaptcha.ready(() => {
                isReady.current = true;
            });
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup script on unmount if needed
            const existingScript = document.querySelector(`script[src*="recaptcha"]`);
            if (existingScript) {
                // Keep script loaded for other components
            }
        };
    }, [siteKey]);

    /**
     * Execute reCAPTCHA and get a token for the specified action.
     * @param {string} action - Action name (e.g., 'login', 'signup', 'contact')
     * @returns {Promise<string|null>} - reCAPTCHA token or null if not ready
     */
    const executeRecaptcha = useCallback(async (action) => {
        if (!siteKey) {
            console.error('reCAPTCHA site key is not configured.');
            return null;
        }

        // Wait for grecaptcha to be ready
        if (!window.grecaptcha) {
            console.warn('reCAPTCHA is not loaded yet.');
            return null;
        }

        try {
            const token = await window.grecaptcha.execute(siteKey, { action });
            return token;
        } catch (error) {
            console.error('reCAPTCHA execution failed:', error);
            return null;
        }
    }, [siteKey]);

    return {
        executeRecaptcha,
        isReady: isReady.current,
        siteKey,
    };
};

export default useRecaptcha;
