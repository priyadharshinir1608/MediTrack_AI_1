import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Pill, 
  PlusCircle, 
  Boxes, 
  Receipt,
  BarChart3, 
  Bell, 
  User, 
  Sparkles,
  LogOut
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Sidebar = ({ collapsed }) => {
  const { logout, user } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }} title="MediTrack AI Dashboard">
        <div className="sidebar-header" style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo">
            <Sparkles size={20} />
          </div>
          {!collapsed && <span className="sidebar-title">MediTrack AI</span>}
        </div>
      </Link>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/medicines" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Pill size={20} />
          {!collapsed && <span>Medicines</span>}
        </NavLink>

        <NavLink to="/add-medicine" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <PlusCircle size={20} />
          {!collapsed && <span>Add (AI Scan)</span>}
        </NavLink>

        <NavLink to="/stock" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Boxes size={20} />
          {!collapsed && <span>Stock & Alerts</span>}
        </NavLink>

        <NavLink to="/billing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Receipt size={20} />
          {!collapsed && <span>Billing & POS</span>}
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={20} />
          {!collapsed && <span>Analytics</span>}
        </NavLink>

        <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bell size={20} />
          {!collapsed && <span>Notifications</span>}
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} />
          {!collapsed && <span>Profile</span>}
        </NavLink>
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <button 
          onClick={logout} 
          className="nav-item" 
          style={{ width: '100%', color: 'var(--danger)', background: 'none' }}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
