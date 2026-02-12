import React, { useState, useRef } from 'react';
import { HabitBubbleConfig } from '../types';
import { ChevronUp } from 'lucide-react';

interface HabitBubbleProps {
  config: HabitBubbleConfig;
  value: number | string;
  statusText?: string;
  onClick: () => void;
  onSwipeUp: () => void;
  onDoubleClick: () => void;
  isActive?: boolean; // For breathing animation
}

const HabitBubble: React.FC<HabitBubbleProps> = ({ 
  config, 
  value, 
  statusText,
  onClick, 
  onSwipeUp, 
  onDoubleClick,
  isActive = false
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [offsetY, setOffsetY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentY = e.targetTouches[0].clientY;
    const diff = currentY - touchStart;
    // Only allow upward drag
    if (diff < 0) {
      setOffsetY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (offsetY < -80) { // Threshold for swipe up
      onSwipeUp();
      if (navigator.vibrate) navigator.vibrate(50);
    }
    setTouchStart(null);
    setOffsetY(0);
  };

  // Determine styles based on ID
  const getBubbleStyle = () => {
    switch (config.id) {
      case 'japanese':
        return isActive 
          ? 'shadow-[0_0_30px_rgba(56,189,248,0.4)] animate-pulse' // Blue glow
          : 'animate-[breathe_4s_ease-in-out_infinite]'; // Gentle breathing
      case 'exercise':
        // Flame intensity based on minutes (value)
        const mins = typeof value === 'number' ? value : 0;
        return mins > 29 ? 'shadow-[0_0_40px_rgba(251,191,36,0.6)] border-amber-300' : '';
      case 'weight':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div 
        className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${getBubbleStyle()}`}
        style={{ 
          backgroundColor: config.color,
          transform: `translateY(${offsetY}px)`,
          opacity: Math.max(0.5, 1 + offsetY / 200)
        }}
        onClick={(e) => {
           // Simple click handler, logic handled by parent (e.g., differentiating double click)
           if (e.detail === 1) onClick();
        }}
        onDoubleClick={onDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Icon */}
        <div className="text-white/90 mb-1 scale-125">
          {config.icon}
        </div>
        
        {/* Label */}
        <span className="text-xs font-bold tracking-widest text-white/80 uppercase">
          {config.label}
        </span>

        {/* Value Display */}
        <div className="mt-1 text-2xl font-mono text-white font-bold">
            {config.id === 'weight' ? (value ? `${value}kg` : '--') : value}
        </div>

        {/* Swipe Hint (Only for exercise) */}
        {config.id === 'exercise' && (
           <div className="absolute -top-8 opacity-0 hover:opacity-100 transition-opacity animate-bounce text-white/50">
             <ChevronUp />
           </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-xs text-slate-500 font-mono h-4">
        {statusText}
      </div>
      
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.02); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default HabitBubble;