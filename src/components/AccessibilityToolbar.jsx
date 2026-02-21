import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTheme } from '../context/ThemeContext';
import { X, Eye, EyeOff, Plus, Minus, RotateCcw, Sun, Moon } from 'lucide-react';
import AccessibilityIcon from './icons/AccessibilityIcon';

const AccessibilityToolbar = () => {
  const {
    highContrast,
    toggleHighContrast,
    increaseTextSize,
    decreaseTextSize,
    resetAccessibility
  } = useAccessibility();

  const { darkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-40"
        aria-label="Open accessibility options"
        title="Accessibility Options"
      >
        <AccessibilityIcon size={24} color="white" />
      </button>



      {/* Click-catcher for closing panel by clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'transparent' }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Accessibility Panel */}
      <div
        className={`fixed bottom-24 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-80 z-50 transform transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        role="dialog"
        aria-label="Accessibility settings"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <AccessibilityIcon size={20} color="#2563eb" />
            Accessibility
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close accessibility options"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* High Contrast */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="flex items-center gap-3">
              {highContrast ? (
                <Eye size={20} className="text-blue-600" />
              ) : (
                <EyeOff size={20} className="text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-800">High Contrast</p>
                <p className="text-xs text-gray-500">Better visibility</p>
              </div>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                highContrast ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-pressed={highContrast}
              aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Text Size */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-blue-600">A</div>
              <div>
                <p className="font-medium text-gray-800">Text Size</p>
                <p className="text-xs text-gray-500">Adjust for readability</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={decreaseTextSize}
                className="p-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition"
                aria-label="Decrease text size"
                title="Decrease"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={increaseTextSize}
                className="p-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition"
                aria-label="Increase text size"
                title="Increase"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon size={20} className="text-blue-600" />
              ) : (
                <Sun size={20} className="text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-800">Theme</p>
                <p className="text-xs text-gray-500">{darkMode ? 'Dark mode' : 'Light mode'}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-pressed={darkMode}
              aria-label={`${darkMode ? 'Switch to light mode' : 'Switch to dark mode'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              resetAccessibility();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            aria-label="Reset all accessibility settings to default"
          >
            <RotateCcw size={18} />
            Reset to Default
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-5 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-1">
          <p className="font-medium text-gray-700 mb-2">Keyboard Shortcuts:</p>
          <div className="space-y-1">
            <p><kbd className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">Tab</kbd> to navigate</p>
            <p><kbd className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">Enter</kbd> to select</p>
            <p><kbd className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">Esc</kbd> to close</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccessibilityToolbar;