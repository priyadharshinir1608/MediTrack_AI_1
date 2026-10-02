import React from 'react';
import { Activity, Sparkles, Pill } from 'lucide-react';

const Loading = ({ 
  message = 'Loading...', 
  subtext = 'Synchronizing pharmacy telemetry & intelligence...',
  size = 'medium', // 'small' | 'medium' | 'large'
  variant = 'default', // 'default' | 'card' | 'fullscreen'
  showDots = true,
  icon: IconComponent = Activity
}) => {
  // Dimensions mapping based on size
  const dimensions = {
    small: {
      container: 50,
      core: 32,
      innerRing: 40,
      outerRing: 50,
      ripple: 54,
      iconSize: 16,
      titleSize: '0.85rem'
    },
    medium: {
      container: 82,
      core: 54,
      innerRing: 68,
      outerRing: 82,
      ripple: 92,
      iconSize: 26,
      titleSize: '0.98rem'
    },
    large: {
      container: 114,
      core: 76,
      innerRing: 96,
      outerRing: 114,
      ripple: 126,
      iconSize: 36,
      titleSize: '1.15rem'
    }
  };

  const dim = dimensions[size] || dimensions.medium;

  // Determine wrapper classes & styles
  let wrapperClass = 'medscan-loader-wrapper fade-in';
  if (variant === 'fullscreen') wrapperClass += ' medscan-loader-fullscreen';
  else if (variant === 'card') wrapperClass += ' medscan-loader-card';

  return (
    <div className={wrapperClass}>
      
      {/* 🔮 Center Orb & Dual Orbital Rings */}
      <div 
        className="medscan-orb-container" 
        style={{ width: `${dim.container}px`, height: `${dim.container}px` }}
      >
        {/* Outward Expanding Radar Ripple */}
        <div 
          className="medscan-ripple" 
          style={{ width: `${dim.ripple}px`, height: `${dim.ripple}px` }} 
        />

        {/* Outer Orbiting Gradient Ring */}
        <div 
          className="medscan-ring-outer" 
          style={{ width: `${dim.outerRing}px`, height: `${dim.outerRing}px` }} 
        />

        {/* Inner Counter-Orbiting Emerald Ring */}
        <div 
          className="medscan-ring-inner" 
          style={{ width: `${dim.innerRing}px`, height: `${dim.innerRing}px` }} 
        />

        {/* Pulsing Core with Medical/AI Icon */}
        <div 
          className="medscan-core" 
          style={{ width: `${dim.core}px`, height: `${dim.core}px` }}
        >
          <IconComponent size={dim.iconSize} color="#38bdf8" />
        </div>
      </div>

      {/* 📝 Animated Message & Dot Pulse */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
        <div className="medscan-loader-title" style={{ fontSize: dim.titleSize }}>
          <span>{message}</span>
          {showDots && (
            <span className="dot-flashing">
              <span></span>
              <span></span>
              <span></span>
            </span>
          )}
        </div>

        {subtext && (
          <div className="medscan-loader-subtext">
            {subtext}
          </div>
        )}
      </div>

    </div>
  );
};

export default Loading;
