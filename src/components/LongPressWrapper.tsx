import React, { useState } from "react";

const LongPressWrapper: React.FC<any> = ({
  children,
  onLongPress,
  onClick,
  delay = 500,
}) => {
  const [pressTimer, setPressTimer] = useState<any>(null);

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      onLongPress();
    }, delay);
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    clearTimeout(pressTimer);
  };

  const handleMouseLeave = () => {
    clearTimeout(pressTimer);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown} // For mobile devices
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp} // For mobile devices
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default LongPressWrapper;
