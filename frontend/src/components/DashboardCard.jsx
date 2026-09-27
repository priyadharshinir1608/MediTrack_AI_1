import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'var(--primary)', subtitle, trend, onClick }) => {
  return (
    <div 
      className="glass-card" 
      onClick={onClick}
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.boxShadow = `0 12px 24px -10px ${color}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
            {title}
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '700', margin: '0.35rem 0', color: 'var(--text-primary)' }}>
            {value}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {subtitle && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {subtitle}
              </span>
            )}
            {onClick && (
              <span style={{ fontSize: '0.7rem', color: color, fontWeight: '600' }}>
                • View details →
              </span>
            )}
          </div>
        </div>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          background: `rgba(255, 255, 255, 0.05)`,
          border: `1px solid var(--glass-border)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0
        }}>
          {Icon && <Icon size={22} />}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
