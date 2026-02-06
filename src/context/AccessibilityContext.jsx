// src/context/AccessibilityContext.jsx
import React, { useState, useEffect } from 'react';
import { AccessibilityContext } from './AccessibilityContextValue';

export { AccessibilityContext };

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('highContrast') === 'true';
  });
  
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('textSize') || 'medium';
  });

  // Apply high contrast
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('highContrast', highContrast);
  }, [highContrast]);

    // Apply text size
    useEffect(() => {
      document.documentElement.setAttribute('data-text-size', textSize);
      localStorage.setItem('textSize', textSize);
    }, [textSize]);
  
    return (
      <AccessibilityContext.Provider value={{ highContrast, setHighContrast, textSize, setTextSize }}>
        {children}
      </AccessibilityContext.Provider>
    );
  };