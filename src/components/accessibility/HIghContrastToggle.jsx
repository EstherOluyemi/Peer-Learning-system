import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

const HighContrastToggle = ({ size = 'default' }) => {
  const { highContrast, toggleHighContrast } = useAccessibility();

  const sizeClasses = {
    small: 'w-12 h-6',
    default: 'w-14 h-7',
    large: 'w-16 h-8'
  };

  return (
    <button
      onClick={toggleHighContrast}
      className={`relative inline-flex items-center transition-colors rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
        highContrast
          ? 'bg-blue-600 hover:bg-blue-700'
          : 'bg-slate-300 hover:bg-slate-400'
      } ${sizeClasses[size]}`}
      aria-pressed={highContrast}
      aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
      title={highContrast ? 'High contrast enabled' : 'Click to enable high contrast'}
    >
      {/* Toggle circle */}
      <span
        className={`inline-flex items-center justify-center absolute w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
          highContrast ? 'translate-x-7' : 'translate-x-0.5'
        }`}
      >
        {highContrast ? (
          <Eye size={14} className="text-blue-700 dark:text-blue-500" />
        ) : (
          <EyeOff size={14} className="text-slate-600" />
        )}
      </span>

      {/* Background indicator */}
      <span className="sr-only">
        {highContrast ? 'High contrast mode is on' : 'High contrast mode is off'}
      </span>
    </button>
  );
};

export default HighContrastToggle;
