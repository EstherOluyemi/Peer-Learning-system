import React from 'react';

/**
 * Detects URLs in text and wraps them in clickable <a> tags.
 * @param {string} text - The text to process.
 * @returns {Array|string} - An array of React elements and strings, or the original text.
 */
export const linkify = (text, customClasses = "") => {
  if (!text || typeof text !== 'string') return text;
  
  // Regex to match URLs starting with http:// or https://
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split text by URLs while capturing the URL matches
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    // If the part matches our URL regex, render it as a link
    if (urlRegex.test(part)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`underline break-all transition-all ${customClasses || 'text-blue-500 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-300'}`}
          onClick={(e) => e.stopPropagation()} // Prevent bubble click events
        >
          {part}
        </a>
      );
    }
    // Otherwise return the text part as is
    return part;
  });
};
