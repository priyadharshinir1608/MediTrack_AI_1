import React, { useState } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'Amoxicillin 250mg is below safety threshold (8 units left).',
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      title: 'Expiry Warning',
      message: 'Cough Syrup 100ml batch B-77889 expires in 28 days.',
      type: 'danger',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      read: false
    },
    {
      id: '3',
      title: 'AI OCR Scan Completed',
      message: 'Paracetamol 500mg strip successfully scanned and registered.',
      type: 'info',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      read: true
    }
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Notifications & Alerts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Real-time event updates powered by Firebase Firestore
          </p>
        </div>
        <button onClick={markAllRead} className="btn btn-secondary">
          <CheckCircle2 size={16} /> Mark All as Read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.length > 0 ? (
          notifications.map(item => {
            const iconColor = item.type === 'danger' ? 'var(--danger)' : (item.type === 'warning' ? 'var(--warning)' : 'var(--primary)');
            const bgGlow = item.type === 'danger' ? 'var(--danger-glow)' : (item.type === 'warning' ? 'var(--warning-glow)' : 'var(--primary-glow)');

            return (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  opacity: item.read ? 0.7 : 1,
                  borderLeft: `4px solid ${iconColor}`
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: bgGlow,
                    color: iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '2px'
                  }}>
                    {item.type === 'danger' ? <Clock size={20} /> : (item.type === 'warning' ? <AlertTriangle size={20} /> : <Bell size={20} />)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{item.message}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </div>

                <button onClick={() => removeNotification(item.id)} className="btn btn-secondary" style={{ padding: '0.35rem' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No new notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
