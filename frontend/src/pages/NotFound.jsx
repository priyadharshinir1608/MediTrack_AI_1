import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '1rem',
      padding: '2rem'
    }}>
      <AlertCircle size={64} color="var(--danger)" />
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700' }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
        The requested resource or medicine record could not be found.
      </p>
      <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
        <Home size={18} /> Return to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
