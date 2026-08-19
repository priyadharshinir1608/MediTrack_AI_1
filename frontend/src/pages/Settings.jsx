import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Database, Cpu, Moon } from 'lucide-react';

const Settings = () => {
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [expiryAlertDays, setExpiryAlertDays] = useState(60);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>System Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Configure AI OCR sensitivity, threshold alerts, and cloud connectivity
        </p>
      </div>

      {saved && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--success-glow)', color: 'var(--success)', fontSize: '0.85rem' }}>
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={20} color="var(--primary)" /> Alert Thresholds
        </h3>

        <div className="form-group">
          <label className="form-label">Low Stock Reorder Threshold (Units)</label>
          <input
            type="number"
            className="form-input"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Medicines below this quantity trigger real-time Firestore notifications.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Expiry Warning Advance Notice (Days)</label>
          <input
            type="number"
            className="form-input"
            value={expiryAlertDays}
            onChange={(e) => setExpiryAlertDays(e.target.value)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Flag medicines expiring within this window.
          </span>
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={20} color="#8b5cf6" /> AI OCR Configuration
          </h3>

          <div className="form-group">
            <label className="form-label">AI Engine Mode</label>
            <select className="form-select" defaultValue="EASYOCR">
              <option value="EASYOCR">OpenCV + EasyOCR + PyZBar (Local Flask)</option>
              <option value="TESSERACT">Tesseract OCR (Fallback)</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ height: '44px' }}>
          Save Configuration
        </button>
      </form>
    </div>
  );
};

export default Settings;
