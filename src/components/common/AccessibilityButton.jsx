import React, { forwardRef } from 'react';

/**
 * A highly accessible Button component that follows WCAG 2.2 best practices.
 * 
 * Features:
 * - Proper aria-label support
 * - Loading state management with aria-busy
 * - Consistent focus styles via global CSS variables
 * - Support for diverse button types and styles
 */
const AccessibilityButton = forwardRef(({
  children,
  onClick,
  type = 'button',
  isLoading = false,
  isDisabled = false,
  ariaLabel,
  className = '',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  ...props
}, ref) => {
  const isButtonDisabled = isDisabled || isLoading;

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-slate-100 focus:ring-slate-500 dark:hover:bg-slate-800'
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isButtonDisabled}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all focus:ring-2 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="sr-only">Loading...</span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
});

AccessibilityButton.displayName = 'AccessibilityButton';

export default AccessibilityButton;
