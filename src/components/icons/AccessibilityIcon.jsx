import React from 'react';

const AccessibilityIcon = ({ size = 24, className = "", color = "currentColor" }) => {
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
      {/* Circle for head */}
      <circle cx="12" cy="5" r="2" fill={color} />
      
      {/* Body and limbs - universal accessibility symbol */}
      <path
        d="M12 8C10.5 8 9.5 8.5 9.5 8.5L8 9L8.5 10L10 9.5C10 9.5 10.5 9.2 11 9.1V11.5L8.5 13L7 19H8.5L9.5 14.5L11 13.5V19H13V13.5L14.5 14.5L15.5 19H17L15.5 13L13 11.5V9.1C13.5 9.2 14 9.5 14 9.5L15.5 10L16 9L14.5 8.5C14.5 8.5 13.5 8 12 8Z"
        fill={color}
      />
      
      {/* Arms spread wide */}
      <path
        d="M4 10L5 11L9 9.5L8.5 8.5L4 10Z"
        fill={color}
      />
      <path
        d="M20 10L19 11L15 9.5L15.5 8.5L20 10Z"
        fill={color}
      />
      
      {/* Outer circle */}
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};

export default AccessibilityIcon;
