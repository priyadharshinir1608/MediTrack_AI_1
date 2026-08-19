import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color = 'var(--primary)', subtitle, trend }) => {
  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
            {title}
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '700', margin: '0.35rem 0', color: 'var(--text-primary)' }}>
            {value}
          </h2>
          {subtitle && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {subtitle}
            </span>
          )}
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
          color: color
        }}>
          {Icon && <Icon size={22} />}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
