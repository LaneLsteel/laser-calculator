import React, { useState } from 'react';

const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute left-full ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg z-10">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
