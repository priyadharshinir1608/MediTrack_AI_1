import React from 'react';
import { FiInfo, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

const Notification = ({ type = 'info', title, message, time }) => {
  const icons = {
    info: <FiInfo style={{ color: 'var(--accent-blue)' }} />,
    success: <FiCheckCircle style={{ color: 'var(--accent-emerald)' }} />,
    warning: <FiAlertTriangle style={{ color: 'var(--accent-amber)' }} />,
    error: <FiXCircle style={{ color: 'var(--accent-red)' }} />
  };

  return (
    <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ fontSize: '1.5rem', marginTop: '0.2rem' }}>
        {icons[type]}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.25rem', color: '#fff' }}>{title}</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{message}</p>
        <span style={{ fontSize: '0.75rem', color: 'rgba(148, 163, 184, 0.6)' }}>{time}</span>
      </div>
    </div>
  );
};

export default Notification;
