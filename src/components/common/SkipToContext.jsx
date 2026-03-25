import React from 'react';

const SkipToContent = () => {
  const handleSkip = (e) => {
    const mainContent = document.querySelector('#main-content') || document.querySelector('main');
    if (mainContent) {
      if (!mainContent.hasAttribute('tabindex')) {
        mainContent.setAttribute('tabindex', '-1');
      }
      mainContent.focus();
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="skip-to-content absolute top-0 left-0 -translate-y-full focus:translate-y-0 bg-blue-600 text-white px-4 py-2 z-50 transition-transform"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;