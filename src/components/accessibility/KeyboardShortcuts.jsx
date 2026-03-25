import React, { useState } from 'react';
import { X, Keyboard } from 'lucide-react';

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { key: 'Tab', description: 'Move focus to next element' },
        { key: 'Shift + Tab', description: 'Move focus to previous element' },
        { key: 'Escape', description: 'Close modals or dropdowns' },
        { key: 'Alt + M', description: 'Toggle sidebar menu' },
        { key: 'Alt + N', description: 'Open notifications' },
      ]
    },
    {
      category: 'Forms',
      items: [
        { key: 'Enter', description: 'Submit form or activate button' },
        { key: 'Space', description: 'Toggle checkboxes or buttons' },
        { key: 'Arrow Keys', description: 'Navigate in dropdowns or date pickers' },
      ]
    },
    {
      category: 'Chat & Messaging',
      items: [
        { key: 'Enter', description: 'Send message' },
        { key: 'Shift + Enter', description: 'New line in message' },
        { key: 'Alt + S', description: 'Focus send button' },
      ]
    },
    {
      category: 'Accessibility',
      items: [
        { key: 'Ctrl + /', description: 'Open keyboard shortcuts (this dialog)' },
        { key: 'Alt + A', description: 'Open accessibility options' },
      ]
    },
  ];

  return (
    <>
      {/* Button to open shortcuts */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        title="Keyboard shortcuts (Ctrl + /)"
        aria-label="Open keyboard shortcuts help"
      >
        <Keyboard size={18} />
        <span className="hidden sm:inline">Shortcuts</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-labelledby="shortcuts-title"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <h2
                id="shortcuts-title"
                className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <Keyboard size={24} className="text-blue-700 dark:text-blue-500" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                aria-label="Close shortcuts dialog"
              >
                <X size={24} className="text-slate-600 dark:text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {shortcuts.map((group, idx) => (
                <section key={idx}>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    {group.category}
                  </h3>
                  <div className="space-y-2">
                    {group.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <span className="text-slate-700 dark:text-slate-300">
                          {item.description}
                        </span>
                        <kbd className="px-3 py-1 text-sm font-semibold text-white bg-slate-700 dark:bg-slate-600 rounded-md whitespace-nowrap ml-4">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400">
                <strong>Tip:</strong> Use these keyboard shortcuts to navigate the application hands-free.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global keyboard shortcut listener */}
      <GlobalKeyboardShortcutListener onOpenShortcuts={() => setIsOpen(true)} />
    </>
  );
};

/**
 * Component to listen for global keyboard shortcuts
 */
const GlobalKeyboardShortcutListener = ({ onOpenShortcuts }) => {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + / to open shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        onOpenShortcuts();
      }

      // Alt + A to open accessibility options (if implementation available)
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        const accessibilityBtn = document.querySelector('[aria-label="Open accessibility options"]');
        if (accessibilityBtn) {
          accessibilityBtn.click();
        }
      }

      // Alt + M to toggle sidebar menu
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const menuToggle = document.querySelector('[aria-label*="sidebar" i], [aria-label*="menu" i]');
        if (menuToggle) {
          menuToggle.click();
        }
      }

      // Alt + N to open notifications
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        const notificationBtn = document.querySelector('[aria-label*="notifications" i], [aria-label*="bell" i]');
        if (notificationBtn) {
          notificationBtn.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenShortcuts]);

  return null;
};

export default KeyboardShortcuts;
