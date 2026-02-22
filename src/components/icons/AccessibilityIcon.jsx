import React from 'react';

const AccessibilityIcon = ({
  size = 24,
  className = "",
  bgColor = "#2563eb",
  fgColor = "#ffffff"
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Solid circular background */}
      <circle cx="12" cy="12" r="12" fill={bgColor} />

      {/* Head */}
      <circle cx="12" cy="5.5" r="2" fill={fgColor} />

      {/* Arms */}
      <path
        d="M6 10H18"
        stroke={fgColor}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Body */}
      <path
        d="M12 8.5V14"
        stroke={fgColor}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Legs */}
      <path
        d="M9.5 18L12 14.5L14.5 18"
        stroke={fgColor}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AccessibilityIcon;
