// src/context/hooks.js
// Separate file for context hooks to comply with Fast Refresh rules
import { useContext } from 'react';
import { AccessibilityContext } from './AccessibilityContextValue';

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
