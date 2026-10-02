import React from 'react';

/**
 * 🔘 ButtonLoader
 * An inline multi-ring spinner with animated flashing dots for form action buttons.
 */
const ButtonLoader = ({ 
  text = 'Processing...', 
  showDots = true 
}) => {
  return (
    <span className="btn-loader-text">
      <span className="btn-spinner-ai" />
      <span>{text}</span>
      {showDots && (
        <span className="dot-flashing" style={{ marginLeft: '1px' }}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      )}
    </span>
  );
};

export default ButtonLoader;
