import { useEffect, useRef } from 'react';

/**
 * Custom hook to trap focus within a modal or dialog
 * Prevents keyboard users from tabbing outside the modal
 * Restores focus to the trigger element when modal closes
 */
export const useFocusTrap = (isOpen, onEscapeKey) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current; // Store ref in variable for cleanup

    // Store the element that was focused before modal opened
    previousActiveElement.current = document.activeElement;

    // Get all focusable elements within the modal
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element in modal
    if (firstElement) {
      firstElement.focus();
    }

    // Handle keyboard events
    const handleKeyDown = (e) => {
      // Handle Escape key
      if (e.key === 'Escape' && onEscapeKey) {
        e.preventDefault();
        onEscapeKey();
        return;
      }

      // Handle Tab key for focus trapping
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift+Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    modal.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the trigger element
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        setTimeout(() => {
          previousActiveElement.current?.focus();
        }, 0);
      }
    };
  }, [isOpen, onEscapeKey]);

  return modalRef;
};
