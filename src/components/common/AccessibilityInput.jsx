import React, { forwardRef } from 'react';

/**
 * A highly accessible Input component that follows WCAG 2.2 best practices.
 * 
 * Features:
 * - Proper label association using id and htmlFor
 * - Error message association via aria-describedby
 * - Required field indication via aria-required
 * - Invalid state indication via aria-invalid
 * - Support for screen reader only labels
 */
const AccessibilityInput = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  required = false,
  className = '',
  labelClassName = '',
  srOnlyLabel = false,
  ...props
}, ref) => {
  const errorId = `${id}-error`;
  const hasError = Boolean(error);

  return (
    <div className={`accessibility-input-container ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`${srOnlyLabel ? 'sr-only' : 'block text-sm font-medium mb-1'} ${labelClassName}`}
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        required={required}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all ${
          hasError
            ? 'border-red-500 focus:ring-red-500'
            : 'focus:ring-blue-500'
        }`}
        style={{
          backgroundColor: 'var(--input-bg)',
          color: 'var(--input-text)',
          borderColor: hasError ? 'var(--error-color, #ef4444)' : 'var(--input-border)'
        }}
        {...props}
      />
      {hasError && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600 flex items-center"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </div>
  );
});

AccessibilityInput.displayName = 'AccessibilityInput';

export default AccessibilityInput;
