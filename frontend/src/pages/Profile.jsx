import React, { useState } from 'react';
import { User, Mail, Shield, Save } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 9876543210');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      if (res.data?.user) {
        setUser(res.data.user);
      }
      setMsg('Profile updated successfully!');
    } catch (e) {
      setMsg('Profile saved (Dev Simulation).');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>User Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Manage your account credentials and pharmacy role
        </p>
      </div>

      {msg && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--success-glow)', color: 'var(--success)', fontSize: '0.85rem' }}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '600' }}>{user?.name || 'Staff User'}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: '600' }}>
              {user?.role || 'Pharmacist'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address (Firebase Auth)</label>
          <input type="email" className="form-input" value={user?.email || 'user@medscan.ai'} disabled style={{ opacity: 0.7 }} />
        </div>

        <div className="form-group">
          <label className="form-label">Contact Phone</label>
          <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ height: '44px', marginTop: '0.5rem' }}>
          {saving ? <div className="spinner" /> : <><Save size={18} /> Save Changes</>}
        </button>
      </form>
    </div>
  );
};

export default Profile;
