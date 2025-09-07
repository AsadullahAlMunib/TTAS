(function() {
    'use strict';
    
    let isInitialized = false, resizeTimeout, globalObserver = null;
    const animatedTracker = new Set();
    const observerMap = new Map();
    const config = { defaultSpeed: 3000, defaultThreshold: 0.1, resizeDelay: 250 };
    
    // ব্রাউজার সাপোর্ট চেক
    const supportsIntersectionObserver = 'IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype;
    
    function typeWriter(text, element, totalDuration) {
        let i = 0;
        // এলিমেন্টকে দৃশ্যমান করুন
        element.style.visibility = 'visible';
        element.style.opacity = '1';
        element.innerHTML = "";
        const speed = text.length > 0 ? totalDuration / text.length : totalDuration;
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                const cursor = document.createElement('span');
                cursor.className = 'ttas-cursor';
                element.appendChild(cursor);
                element.removeAttribute('aria-live');
            }
        }
        type();
    }
    
    function injectStyles() {
        if (document.querySelector('style[data-ttas-styles]')) return;
        
        const style = document.createElement('style');
        style.setAttribute('data-ttas-styles', 'true');
        style.textContent = `
            .ttas-cursor {
                display: inline-block;
                background-color: #3498db;
                width: 2px;
                height: 1em;
                margin-left: 2px;
                animation: ttas-blink 1s infinite;
                vertical-align: middle;
            }
            @keyframes ttas-blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            [data-ttas]:not([data-ttas-visible]) {
                visibility: hidden;
                opacity: 0;
                height: auto !important;
                overflow: hidden !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    function getFontHeight(element) {
        const temp = document.createElement('span');
        temp.textContent = 'H';
        temp.style.cssText = 'font-size:' + getComputedStyle(element).fontSize + ';font-family:' + getComputedStyle(element).fontFamily + ';visibility:hidden;position:absolute;white-space:nowrap;pointer-events:none;';
        document.body.appendChild(temp);
        const height = temp.offsetHeight;
        document.body.removeChild(temp);
        return height;
    }
    
    function parseTTASAttribute(value) {
        // Empty attribute fallback
        if (!value || value.trim() === "") {
            return { valid: false, isExplicitEmpty: true };
        }
        
        const parts = value.split(';');
        let mobileSpeed = config.defaultSpeed, desktopSpeed = config.defaultSpeed;
        let mobileOffset = null, desktopOffset = null;
        
        try {
            if (parts[0].includes(',')) {
                const speeds = parts[0].split(',');
                mobileSpeed = parseInt(speeds[0]) || config.defaultSpeed;
                desktopSpeed = parseInt(speeds[1]) || config.defaultSpeed;
                if (isNaN(mobileSpeed) || isNaN(desktopSpeed)) throw new Error('Invalid speed values');
            } else {
                mobileSpeed = desktopSpeed = parseInt(parts[0]) || config.defaultSpeed;
                if (isNaN(mobileSpeed)) throw new Error('Invalid speed value');
            }
            
            if (parts.length > 1 && parts[1].trim() !== "") {
                const offsets = parts[1].split(',');
                if (offsets.length === 1) {
                    mobileOffset = desktopOffset = parseInt(offsets[0]);
                    if (isNaN(mobileOffset)) mobileOffset = desktopOffset = null;
                } else if (offsets.length === 2) {
                    mobileOffset = parseInt(offsets[0]);
                    desktopOffset = parseInt(offsets[1]);
                    if (isNaN(mobileOffset)) mobileOffset = null;
                    if (isNaN(desktopOffset)) desktopOffset = null;
                }
            }
            
            return { valid: true, mobileSpeed, desktopSpeed, mobileOffset, desktopOffset };
        } catch (error) {
            console.error('TTAS Parse Error:', error.message);
            return { valid: false, error: error.message };
        }
    }
    
    // Fallback for browsers without IntersectionObserver
    function initFallback() {
        const elements = document.querySelectorAll('[data-ttas]');
        
        elements.forEach(el => {
            const attrValue = el.getAttribute('data-ttas');
            const config = parseTTASAttribute(attrValue);
            
            // Empty attribute হলে static text দেখাবে
            if (config.isExplicitEmpty) {
                el.setAttribute('data-ttas-visible', 'true');
                return;
            }
            
            if (config.valid) {
                const isMobile = window.innerWidth < 768;
                const speed = isMobile ? config.mobileSpeed : config.desktopSpeed;
                
                const originalText = el.innerHTML;
                el.setAttribute('data-ttas-original', originalText);
                el.setAttribute('aria-live', 'polite');
                el.setAttribute('data-ttas-visible', 'true');
                
                // Immediate typing without scroll detection
                typeWriter(originalText, el, speed);
                animatedTracker.add(el);
            }
        });
    }
    
    function initTTAS() {
        if (!supportsIntersectionObserver) {
            console.warn('TTAS: IntersectionObserver not supported, using fallback');
            initFallback();
            return;
        }
        
        if (isInitialized && globalObserver) {
            globalObserver.disconnect();
        }
        
        injectStyles();
        
        const elements = document.querySelectorAll('[data-ttas]');
        const isMobile = window.innerWidth < 768;
        
        // Global observer তৈরি করুন
        globalObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    if (animatedTracker.has(element) || element.hasAttribute('data-ttas-visible')) {
                        return;
                    }
                    
                    const attrValue = element.getAttribute('data-ttas');
                    const config = parseTTASAttribute(attrValue);
                    
                    // Empty attribute হলে static text দেখাবে
                    if (config.isExplicitEmpty) {
                        element.setAttribute('data-ttas-visible', 'true');
                        globalObserver.unobserve(element);
                        return;
                    }
                    
                    if (!config.valid) {
                        globalObserver.unobserve(element);
                        return;
                    }
                    
                    // এলিমেন্টটি দৃশ্যমান হলে টাইপিং শুরু করুন
                    element.setAttribute('data-ttas-visible', 'true');
                    
                    const speed = isMobile ? config.mobileSpeed : config.desktopSpeed;
                    const originalText = element.innerHTML;
                    element.setAttribute('data-ttas-original', originalText);
                    element.setAttribute('aria-live', 'polite');
                    
                    typeWriter(originalText, element, speed);
                    animatedTracker.add(element);
                    globalObserver.unobserve(element);
                }
            });
        }, { threshold: config.defaultThreshold });
        
        elements.forEach(el => {
            // যদি ইতিমধ্যে অ্যানিমেটেড হয় বা visible attribute থাকে, তাহলে স্কিপ করুন
            if (animatedTracker.has(el) || el.hasAttribute('data-ttas-visible')) {
                return;
            }
            
            const attrValue = el.getAttribute('data-ttas');
            const config = parseTTASAttribute(attrValue);
            
            // Empty attribute হলে static text দেখাবে কিন্তু দৃশ্যমান রাখবে
            if (config.isExplicitEmpty) {
                el.setAttribute('data-ttas-visible', 'true');
                return;
            }
            
            if (!config.valid) {
                return;
            }
            
            // এলিমেন্টটি initially লুকানো রাখুন
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            
            const isMobile = window.innerWidth < 768;
            const offsetConfig = isMobile ? config.mobileOffset : config.desktopOffset;
            const fontHeight = getFontHeight(el);
            const offset = offsetConfig !== null ? offsetConfig : fontHeight;
            
            // Dynamic rootMargin with offset সেট করুন
            globalObserver.observe(el);
            observerMap.set(el, globalObserver);
        });
        
        isInitialized = true;
    }
    
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentIsMobile = window.innerWidth < 768;
            if (currentIsMobile !== (window.ttasLastDeviceType === 'mobile')) {
                initTTAS();
                window.ttasLastDeviceType = currentIsMobile ? 'mobile' : 'desktop';
            }
        }, config.resizeDelay);
    }
    
    // DOM ready handler
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTTAS);
    } else {
        initTTAS();
    }
    
    window.addEventListener('resize', handleResize);
    
    window.TTAS = {
        init: initTTAS,
        version: '1.2.2',
        supportsObserver: supportsIntersectionObserver,
        destroy: function() {
            const elements = document.querySelectorAll('[data-ttas]');
            elements.forEach(el => {
                if (el.hasAttribute('data-ttas-original')) {
                    const originalText = el.getAttribute('data-ttas-original');
                    el.innerHTML = originalText;
                }
                el.removeAttribute('aria-live');
                el.removeAttribute('data-ttas-original');
                el.removeAttribute('data-ttas-visible');
                el.style.visibility = '';
                el.style.opacity = '';
                const cursor = el.querySelector('.ttas-cursor');
                if (cursor) cursor.remove();
            });
            
            observerMap.forEach((observer, element) => {
                observer.unobserve(element);
            });
            observerMap.clear();
            
            if (globalObserver) {
                globalObserver.disconnect();
                globalObserver = null;
            }
            
            window.removeEventListener('resize', handleResize);
            const styleElement = document.querySelector('style[data-ttas-styles]');
            if (styleElement) styleElement.remove();
            
            animatedTracker.clear();
            isInitialized = false;
        }
    };
})();
