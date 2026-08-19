import React, { useState } from 'react';
import { Menu, Search, Bell, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button onClick={toggleSidebar} className="btn-secondary" style={{ padding: '0.5rem' }}>
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search medicine, batch, barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '280px', height: '38px', borderRadius: 'var(--radius-full)' }}
          />
        </form>
      </div>

      <div className="navbar-right">
        <button 
          onClick={() => navigate('/notifications')} 
          className="btn-secondary" 
          style={{ position: 'relative', padding: '0.55rem', borderRadius: '50%' }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--danger)'
          }} />
        </button>

        <div 
          onClick={() => navigate('/profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={18} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user?.name || 'Staff'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role || 'Pharmacist'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
