import React, { createContext, useState, useContext } from 'react';

export const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState('medium'); // small, medium, large
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);

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