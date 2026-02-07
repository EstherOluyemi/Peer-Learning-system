import React from 'react';

const SkipToContent = () => {
  const handleSkip = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.focus();
    }
  };

  return (
    <button
      onClick={handleSkip}
      className="skip-to-content absolute top-0 left-0 -translate-y-full focus:translate-y-0 bg-blue-600 text-white px-4 py-2 z-50 transition-transform"
      aria-label="Skip to main content"
    >
      Skip to main content
    </button>
  );
};

export default SkipToContent;