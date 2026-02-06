// src/components/AccessibilityToolbar.jsx
import React from 'react';
import { useAccessibility } from '../context/hooks';
import { Contrast, Type, ZoomIn, ZoomOut } from 'lucide-react';

const AccessibilityToolbar = () => {
  const { highContrast, toggleHighContrast, textSize, updateTextSize } = useAccessibility();

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-slate-200 p-3 flex flex-col gap-2" role="toolbar" aria-label="Accessibility controls">
      <button
        onClick={toggleHighContrast}
        className="p-2 hover:bg-slate-100 rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
        aria-pressed={highContrast}
      >
        <Contrast className={`w-5 h-5 ${highContrast ? 'text-blue-600' : 'text-slate-600'}`} />
      </button>
      
      <div className="flex gap-1" role="group" aria-label="Text size controls">
        <button
          onClick={() => updateTextSize('medium')}
          className={`p-2 rounded-md ${textSize === 'medium' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label="Medium text size"
          aria-pressed={textSize === 'medium'}
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={() => updateTextSize('large')}
          className={`p-2 rounded-md ${textSize === 'large' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label="Large text size"
          aria-pressed={textSize === 'large'}
        >
          <Type className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AccessibilityToolbar;