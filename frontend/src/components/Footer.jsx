import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div>
        <span>MedScan AI &copy; {new Date().getFullYear()} — Pharmacy Intelligence System</span>
      </div>
      <div>
        <span style={{ color: 'var(--primary)' }}>v1.0.0 (B.Sc. CS Final Project)</span>
      </div>
    </footer>
  );
};

export default Footer;
