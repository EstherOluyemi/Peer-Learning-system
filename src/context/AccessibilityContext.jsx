import React, { createContext, useState, useContext, useEffect } from 'react';

export const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState('medium'); // small, medium, large
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);

  useEffect(() => {
    // Enhanced focus management: Only add tabindex to major landmark regions
    // that explicitly opt-in via data-a11y-focus-region attribute
    const focusableRegionSelector = '[data-a11y-focus-region="true"]';

    const applyRegionFocusability = () => {
      const regions = document.querySelectorAll(focusableRegionSelector);
      regions.forEach((element) => {
        if (!(element instanceof HTMLElement)) return;
        if (element.hasAttribute('tabindex')) return;
        if (element.getAttribute('aria-hidden') === 'true') return;
        // Only add tabindex=-1 so region is focusable programmatically
        // but not in natural tab order (user must use skip links or deliberate focus)
        element.setAttribute('tabindex', '-1');
        element.setAttribute('data-a11y-auto-focusable', 'true');
      });

      if (keyboardShortcutsEnabled) {
        const textElements = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = textElements.nextNode())) {
          if (node.nodeValue.trim().length > 0) {
            const parent = node.parentElement;
            if (parent && !parent.closest('a, button, [role="button"], input, select, textarea, [tabindex="-1"]')) {
              if (parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE' && parent.tagName !== 'NOSCRIPT') {
                if (!parent.hasAttribute('tabindex')) {
                  parent.setAttribute('tabindex', '0');
                  parent.setAttribute('data-a11y-text-focusable', 'true');
                }
              }
            }
          }
        }
      }
    };

    applyRegionFocusability();

    const observer = new MutationObserver(() => {
      applyRegionFocusability();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [keyboardShortcutsEnabled]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    htmlElement.classList.add(`text-size-${textSize}`);
  }, [textSize]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (highContrast) {
      htmlElement.classList.add('high-contrast');
    } else {
      htmlElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const increaseTextSize = () => {
    if (textSize === 'small') setTextSize('medium');
    else if (textSize === 'medium') setTextSize('large');
  };

  const decreaseTextSize = () => {
    if (textSize === 'large') setTextSize('medium');
    else if (textSize === 'medium') setTextSize('small');
  };

  const resetAccessibility = () => {
    setHighContrast(false);
    setTextSize('medium');
  };

  // Apply accessibility styles globally
  const accessibilityClasses = `
    ${highContrast ? 'high-contrast' : ''}
    text-size-${textSize}
  `;

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      textSize,
      keyboardShortcutsEnabled,
      toggleHighContrast,
      increaseTextSize,
      decreaseTextSize,
      resetAccessibility,
      setKeyboardShortcutsEnabled,
      accessibilityClasses
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}; 