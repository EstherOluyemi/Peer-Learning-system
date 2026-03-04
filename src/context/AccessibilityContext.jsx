import React, { createContext, useState, useContext, useEffect } from 'react';

export const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState('medium'); // small, medium, large
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);

  useEffect(() => {
    const focusableRegionSelector = [
      'main',
      '[role="main"]',
      'section',
      'article',
      '[role="region"]',
      'header',
      'footer',
      'aside',
      'nav',
      '[role="contentinfo"]',
      '[role="banner"]',
      '[data-a11y-focus-region="true"]',
    ].join(',');

    const applyRegionFocusability = () => {
      const regions = document.querySelectorAll(focusableRegionSelector);
      regions.forEach((element) => {
        if (!(element instanceof HTMLElement)) return;
        if (element.hasAttribute('tabindex')) return;
        if (element.getAttribute('aria-hidden') === 'true') return;
        element.setAttribute('tabindex', '0');
        element.setAttribute('data-a11y-auto-focusable', 'true');
      });
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
  }, []);

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
      <div className={accessibilityClasses}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}; 