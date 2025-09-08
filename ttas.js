/**
 * TTAS (Text Typing Animation Scroll)
 * Version: 1.3.0
 * Author: Md Asadullah Al Munib
 * A robust, performant, and feature-rich vanilla JavaScript library
 * for typewriter animation for text on scroll.
 */

(function() {
    'use strict';

    let isInitialized = false, resizeTimeout;
    const animatedTracker = new Set();
    const observerMap = new Map();
    const config = { defaultSpeed: 3000, defaultThreshold: 0.1, resizeDelay: 250 };

    // Browser Support Check
    const supportsIntersectionObserver =
        'IntersectionObserver' in window &&
        'IntersectionObserverEntry' in window &&
        'intersectionRatio' in window.IntersectionObserverEntry.prototype;

    /**
     * HTML-preserving Typewriter
     */
    function typeWriterHTML(html, element, totalDuration) {
        element.style.visibility = 'visible';
        element.style.opacity = '1';
        element.innerHTML = "";

        // Parse HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        const nodes = Array.from(tempDiv.childNodes);

        // Count text length (excluding tags)
        const totalText = nodes.reduce((acc, node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return acc + node.textContent.length;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                return acc + node.textContent.length;
            }
            return acc;
        }, 0);

        const speed = totalText > 0 ? totalDuration / totalText : totalDuration;

        let nodeIndex = 0, charIndex = 0;

        function typeNext() {
            if (nodeIndex >= nodes.length) {
                // শেষে cursor যোগ করা
                const cursor = document.createElement("span");
                cursor.className = "ttas-cursor";
                element.appendChild(cursor);
                element.removeAttribute("aria-live");
                return;
            }

            const currentNode = nodes[nodeIndex];

            if (currentNode.nodeType === Node.TEXT_NODE) {
                const text = currentNode.textContent;
                if (charIndex < text.length) {
                    element.appendChild(document.createTextNode(text.charAt(charIndex)));
                    charIndex++;
                    setTimeout(typeNext, speed);
                } else {
                    charIndex = 0;
                    nodeIndex++;
                    setTimeout(typeNext, speed);
                }
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                const clone = currentNode.cloneNode(false);
                element.appendChild(clone);

                const innerText = currentNode.textContent;
                let innerIndex = 0;

                function typeInside() {
                    if (innerIndex < innerText.length) {
                        clone.appendChild(document.createTextNode(innerText.charAt(innerIndex)));
                        innerIndex++;
                        setTimeout(typeInside, speed);
                    } else {
                        nodeIndex++;
                        charIndex = 0;
                        setTimeout(typeNext, speed);
                    }
                }

                typeInside();
            } else {
                nodeIndex++;
                setTimeout(typeNext, speed);
            }
        }

        typeNext();
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
        temp.style.cssText = 'font-size:' + getComputedStyle(element).fontSize +
            ';font-family:' + getComputedStyle(element).fontFamily +
            ';visibility:hidden;position:absolute;white-space:nowrap;pointer-events:none;';
        document.body.appendChild(temp);
        const height = temp.offsetHeight;
        document.body.removeChild(temp);
        return height;
    }

    function parseTTASAttribute(value) {
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
            const cfg = parseTTASAttribute(attrValue);

            if (cfg.isExplicitEmpty) {
                el.setAttribute('data-ttas-visible', 'true');
                return;
            }

            if (cfg.valid) {
                const isMobile = window.innerWidth < 768;
                const speed = isMobile ? cfg.mobileSpeed : cfg.desktopSpeed;

                const originalText = el.innerHTML;
                el.setAttribute('data-ttas-original', originalText);
                el.setAttribute('aria-live', 'polite');
                el.setAttribute('data-ttas-visible', 'true');

                typeWriterHTML(originalText, el, speed);
                animatedTracker.add(el);
            }
        });
    }

    function createObserverForElement(element, cfg) {
        const isMobile = window.innerWidth < 768;
        const offsetConfig = isMobile ? cfg.mobileOffset : cfg.desktopOffset;
        const fontHeight = getFontHeight(element);
        const offset = offsetConfig !== null ? offsetConfig : fontHeight;

        const rootMargin = `0px 0px -${offset}px 0px`;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (animatedTracker.has(element) || element.hasAttribute('data-ttas-visible')) {
                        observer.unobserve(element);
                        return;
                    }

                    if (cfg.isExplicitEmpty) {
                        element.setAttribute('data-ttas-visible', 'true');
                        observer.unobserve(element);
                        return;
                    }

                    if (!cfg.valid) {
                        observer.unobserve(element);
                        return;
                    }

                    element.setAttribute('data-ttas-visible', 'true');
                    const speed = isMobile ? cfg.mobileSpeed : cfg.desktopSpeed;
                    const originalText = element.innerHTML;
                    element.setAttribute('data-ttas-original', originalText);
                    element.setAttribute('aria-live', 'polite');

                    typeWriterHTML(originalText, element, speed);
                    animatedTracker.add(element);
                    observer.unobserve(element);
                    observerMap.delete(element);
                }
            });
        }, { threshold: config.defaultThreshold, rootMargin });

        observerMap.set(element, observer);
        observer.observe(element);
    }

    function initTTAS() {
        if (!supportsIntersectionObserver) {
            console.warn('TTAS: IntersectionObserver not supported, using fallback');
            initFallback();
            return;
        }

        injectStyles();

        const elements = document.querySelectorAll('[data-ttas]');

        elements.forEach(el => {
            if (animatedTracker.has(el) || el.hasAttribute('data-ttas-visible')) return;

            const attrValue = el.getAttribute('data-ttas');
            const cfg = parseTTASAttribute(attrValue);

            if (cfg.isExplicitEmpty) {
                el.setAttribute('data-ttas-visible', 'true');
                return;
            }

            if (!cfg.valid) return;

            el.style.visibility = 'hidden';
            el.style.opacity = '0';

            createObserverForElement(el, cfg);
        });

        isInitialized = true;
    }

    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentIsMobile = window.innerWidth < 768;
            if (currentIsMobile !== (window.ttasLastDeviceType === 'mobile')) {
                observerMap.forEach((observer, element) => observer.unobserve(element));
                observerMap.clear();

                initTTAS();
                window.ttasLastDeviceType = currentIsMobile ? 'mobile' : 'desktop';
            }
        }, config.resizeDelay);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTTAS);
    } else {
        initTTAS();
    }

    window.addEventListener('resize', handleResize);

    window.TTAS = {
        init: initTTAS,
        version: '1.3.0',
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

            observerMap.forEach((observer, element) => observer.unobserve(element));
            observerMap.clear();

            window.removeEventListener('resize', handleResize);
            const styleElement = document.querySelector('style[data-ttas-styles]');
            if (styleElement) styleElement.remove();

            animatedTracker.clear();
            isInitialized = false;
        }
    };
})();
