import React from 'react';
import { Activity, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * 🛡️ FormLoadingOverlay
 * A frosted, cybernetic glass loading overlay that covers forms during submit/processing.
 * Features:
 * - Top laser scan beam
 * - Pulsing AI core orb with counter-rotating rings
 * - Shimmer title and animated step/status dots
 * - Secondary subtitle with security/telemetry status
 */
const FormLoadingOverlay = ({
  active = false,
  title = 'Processing Request...',
  subtitle = 'Synchronizing records with database...',
  icon: IconComponent = Activity,
  badge = null
}) => {
  if (!active) return null;

  return (
    <div className="form-loading-overlay">
      {/* ⚡ Top Cybernetic Laser Beam */}
      <div className="form-overlay-laser" />

      {/* 🔮 Center Orb Loader */}
      <div className="medscan-orb-container" style={{ width: '64px', height: '64px' }}>
        <div className="medscan-ripple" style={{ width: '72px', height: '72px' }} />
        <div className="medscan-ring-outer" style={{ width: '64px', height: '64px' }} />
        <div className="medscan-ring-inner" style={{ width: '52px', height: '52px' }} />
        <div className="medscan-core" style={{ width: '42px', height: '42px' }}>
          <IconComponent size={20} color="#38bdf8" />
        </div>
      </div>

      {/* 📝 Status Information */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', textAlign: 'center' }}>
        {badge && (
          <span style={{
            fontSize: '0.72rem',
            padding: '0.15rem 0.55rem',
            borderRadius: '9999px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontWeight: '600',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            {badge}
          </span>
        )}

        <div className="medscan-loader-title" style={{ fontSize: '0.98rem' }}>
          <span>{title}</span>
          <span className="dot-flashing">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>

        {subtitle && (
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            maxWidth: '340px',
            margin: 0,
            lineHeight: 1.35
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormLoadingOverlay;
