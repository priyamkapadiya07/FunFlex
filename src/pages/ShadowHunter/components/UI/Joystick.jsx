import React, { useRef, useState, useEffect } from 'react';

export default function Joystick({ onChange, onInteract, color = "rgba(255, 255, 255, 0.2)", size = 120, isRotated = false }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const activeTouchId = useRef(null);

  const handleStart = (e) => {
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    updatePosition(touch);
    if (onInteract) onInteract(true);
  };

  const handleMove = (e) => {
    if (activeTouchId.current === null) return;
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        updatePosition(e.changedTouches[i]);
        break;
      }
    }
  };

  const handleEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        activeTouchId.current = null;
        setPosition({ x: 0, y: 0 });
        if (onChange) onChange({ x: 0, y: 0 });
        if (onInteract) onInteract(false);
        break;
      }
    }
  };

  const updatePosition = (touch) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;
    
    if (isRotated) {
      const physX = deltaX;
      const physY = deltaY;
      deltaX = physY;
      deltaY = -physX;
    }
    
    const maxRadius = size / 2;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }
    
    setPosition({ x: deltaX, y: deltaY });
    
    // Normalize -1 to 1
    if (onChange) {
      onChange({ x: deltaX / maxRadius, y: deltaY / maxRadius });
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: '50%',
        position: 'relative',
        touchAction: 'none'
      }}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
    >
      <div 
        style={{
          width: size / 2.5,
          height: size / 2.5,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '50%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          pointerEvents: 'none',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
      />
    </div>
  );
}
