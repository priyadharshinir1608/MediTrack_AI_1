import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: '1rem'
    }}>
      <div className="spinner" style={{ width: '36px', height: '36px' }}></div>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{message}</span>
    </div>
  );
};

export default Loading;
