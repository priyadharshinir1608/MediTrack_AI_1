import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, Info, X, ArrowRight } from 'lucide-react';

const AuthNotification = ({
  type = 'warning',
  title,
  message,
  actionText,
  onAction,
  onClose,
  shake = false
}) => {
  if (!message && !title) return null;

  const iconMap = {
    warning: <AlertTriangle size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />,
    error: <AlertOctagon size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />,
    success: <CheckCircle2 size={20} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />,
    info: <Info size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
  };

  const typeClass = `auth-popup-${type || 'warning'}`;
  const shakeClass = shake ? 'auth-popup-shake' : '';

  return (
    <div className={`auth-popup-container ${typeClass} ${shakeClass}`}>
      {iconMap[type] || iconMap.warning}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {title && (
          <h4 style={{
            fontSize: '0.925rem',
            fontWeight: '700',
            letterSpacing: '-0.01em',
            margin: 0,
            color: 'currentColor'
          }}>
            {title}
          </h4>
        )}

        <p style={{
          fontSize: '0.825rem',
          margin: 0,
          lineHeight: '1.45',
          opacity: 0.95,
          color: 'var(--text-primary)'
        }}>
          {message}
        </p>

        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            style={{
              alignSelf: 'flex-start',
              marginTop: '0.45rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              background: type === 'error' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
              border: `1px solid ${type === 'error' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`,
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{actionText}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'currentColor',
            opacity: 0.65,
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}
          title="Dismiss notice"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AuthNotification;
