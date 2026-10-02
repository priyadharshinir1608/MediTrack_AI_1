import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  Save, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Sliders,
  ListFilter
} from 'lucide-react';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import FormLoadingOverlay from '../components/FormLoadingOverlay';
import ButtonLoader from '../components/ButtonLoader';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'settings'

  // Notification List State
  const [notifications, setNotifications] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);

  // Settings State
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [runningCheck, setRunningCheck] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'info', text: '' }

  // Channel Settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Daily Schedule Time
  const [dailyAlertTime, setDailyAlertTime] = useState('08:00');
  const [currentTime, setCurrentTime] = useState('');

  // Expiry Settings
  const [expiryEnabled, setExpiryEnabled] = useState(true);
  const [milestones, setMilestones] = useState({
    30: true,
    10: true,
    5: true,
    1: true,
    0: true // Expired
  });

  // Low Stock Settings
  const [lowStockEnabled, setLowStockEnabled] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Scan Diagnostics
  const [lastScanResult, setLastScanResult] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      setFeedLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.warn('[Notifications] Failed to fetch feed:', err.message);
      // Fallback local mock if offline
      setNotifications([
        {
          id: '1',
          title: 'Low Stock Alert',
          message: 'Amoxicillin 250mg is below safety threshold (8 units left).',
          type: 'warning',
          timestamp: new Date().toISOString(),
          isRead: false
        },
        {
          id: '2',
          title: 'Expiry Warning',
          message: 'Ciplox Eye/Ear Drops 10ml batch B-77889 expires in 10 days.',
          type: 'danger',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          isRead: false
        }
      ]);
    } finally {
      setFeedLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = await api.get('/notifications/settings');
      if (res.data?.success) {
        const s = res.data.alertSettings || {};
        setEmailAlerts(s.email !== false);
        setWhatsappAlerts(s.whatsapp !== false);
        setDailyAlertTime(s.dailyAlertTime || '08:00');
        setUserEmail(res.data.userEmail || '');
        setContactNumber(res.data.contactNumber || '');
        setCurrentTime(res.data.currentTime || '');

        if (s.expiry) {
          setExpiryEnabled(s.expiry.enabled !== false);
          const daysArr = s.expiry.days || [30, 10, 5, 1];
          setMilestones({
            30: daysArr.includes(30),
            10: daysArr.includes(10),
            5: daysArr.includes(5),
            1: daysArr.includes(1),
            0: true
          });
        }

        if (s.lowStock) {
          setLowStockEnabled(s.lowStock.enabled !== false);
          if (s.lowStock.threshold) setLowStockThreshold(s.lowStock.threshold);
        }
      }
    } catch (err) {
      console.warn('[Notifications] Failed to fetch alert settings:', err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMilestoneToggle = (day) => {
    setMilestones(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const selectedDays = [];
    if (milestones[30]) selectedDays.push(30);
    if (milestones[10]) selectedDays.push(10);
    if (milestones[5]) selectedDays.push(5);
    if (milestones[1]) selectedDays.push(1);

    const payload = {
      email: userEmail,
      contactNumber,
      alertSettings: {
        email: emailAlerts,
        whatsapp: whatsappAlerts,
        dailyAlertTime,
        expiry: {
          enabled: expiryEnabled,
          days: selectedDays
        },
        lowStock: {
          enabled: lowStockEnabled,
          threshold: Number(lowStockThreshold)
        }
      }
    };

    try {
      const res = await api.put('/notifications/settings', payload);
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          text: `Settings saved! Daily alerts scheduled for ${dailyAlertTime} every day.`
        });
      } else {
        setFeedback({ type: 'error', text: res.data?.message || 'Failed to update alert settings.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error saving alert configuration.' });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setFeedback(null);

    try {
      const res = await api.post('/notifications/test-email', { email: userEmail });
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          text: `📧 Test email dispatched to ${userEmail || 'registered email'}! Check your inbox.`
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to send test email.' });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!contactNumber) {
      setFeedback({
        type: 'error',
        text: 'Please enter your WhatsApp contact number before sending a test.'
      });
      return;
    }

    setTestingWhatsApp(true);
    setFeedback(null);

    try {
      const res = await api.post('/notifications/test-whatsapp', { contactNumber });
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          text: `💬 Test WhatsApp alert dispatched to ${contactNumber}!`
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to send test WhatsApp.' });
    } finally {
      setTestingWhatsApp(false);
    }
  };

  const handleRunScanNow = async () => {
    setRunningCheck(true);
    setLastScanResult(null);

    try {
      const res = await api.post('/notifications/run-daily-check', {});
      if (res.data?.success) {
        setLastScanResult(res.data);
        setFeedback({
          type: 'success',
          text: `✅ Alert Scan complete! Dispatched messages across active Email & WhatsApp channels.`
        });
        fetchNotifications();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error executing alert scan.' });
    } finally {
      setRunningCheck(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={26} color="var(--primary)" /> Notifications & Alert Rules
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage in-app real-time event updates and configure daily automated Gmail & WhatsApp alerts.
          </p>
        </div>

        {currentTime && (
          <div style={{ padding: '0.35rem 0.75rem', borderRadius: '9999px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#60a5fa', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} /> Server Time: {currentTime}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'feed' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'feed' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <ListFilter size={18} /> Live Alerts Feed ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'settings' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'settings' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Sliders size={18} /> Alert Channels & Time Settings
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div style={{
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          background: feedback.type === 'success' ? 'var(--success-glow)' : (feedback.type === 'error' ? 'var(--danger-glow)' : 'var(--primary-glow)'),
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : (feedback.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)')}`,
          color: feedback.type === 'success' ? 'var(--success)' : (feedback.type === 'error' ? 'var(--danger)' : 'var(--primary)'),
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: LIVE ALERTS FEED */}
      {/* ==================================================================== */}
      {activeTab === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Real-time in-app telemetry from Firestore database:
            </span>
            <button onClick={markAllRead} className="btn btn-secondary" style={{ height: '36px', fontSize: '0.8rem' }}>
              <CheckCircle2 size={14} /> Mark All as Read
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
                      opacity: item.isRead ? 0.65 : 1,
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
                        marginTop: '2px',
                        flexShrink: 0
                      }}>
                        {item.type === 'danger' ? <Clock size={20} /> : (item.type === 'warning' ? <AlertTriangle size={20} /> : <Bell size={20} />)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{item.title}</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{item.message}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                          {item.timestamp ? formatDate(item.timestamp) : 'Just now'}
                        </span>
                      </div>
                    </div>

                    <button onClick={() => removeNotification(item.id)} className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none' }} title="Dismiss">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No active in-app notifications.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ALERT SETTINGS & AUTOMATION (Gmail + WhatsApp + Time) */}
      {/* ==================================================================== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          <FormLoadingOverlay 
            active={saving} 
            title="Saving Notification Settings" 
            subtitle="Synchronizing Gmail & WhatsApp channels and daily cron alerts..." 
            badge="Alert Engine" 
          />

          {/* 📬 SECTION 1: Delivery Channels (Gmail + WhatsApp) */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <Bell size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Alert Delivery Channels</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              
              {/* 📧 Channel 1: Gmail */}
              <div style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${emailAlerts ? 'rgba(59, 130, 246, 0.4)' : 'var(--glass-border)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem', color: '#60a5fa' }}>
                    <Mail size={20} /> Gmail / Email Alerts
                  </div>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                    <input 
                      type="checkbox" 
                      checked={emailAlerts} 
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: emailAlerts ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      transition: '.3s', borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute', content: '""', height: '18px', width: '18px', left: emailAlerts ? '26px' : '4px', bottom: '4px',
                        backgroundColor: 'white', transition: '.3s', borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Sends daily HTML emails with formatted batch, expiry, and quantity telemetry.
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Recipient Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. pharmacy.owner@gmail.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail || !emailAlerts}
                  className="btn btn-secondary"
                  style={{ height: '36px', fontSize: '0.8rem', marginTop: '0.25rem' }}
                >
                  {testingEmail ? <ButtonLoader text="Sending Test Email..." /> : <><Send size={14} /> Send Test Email</>}
                </button>
              </div>

              {/* 💬 Channel 2: WhatsApp */}
              <div style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${whatsappAlerts ? 'rgba(34, 197, 94, 0.4)' : 'var(--glass-border)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem', color: '#22c55e' }}>
                    <MessageSquare size={20} /> WhatsApp Alerts
                  </div>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                    <input 
                      type="checkbox" 
                      checked={whatsappAlerts} 
                      onChange={(e) => setWhatsappAlerts(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: whatsappAlerts ? '#22c55e' : 'rgba(255,255,255,0.1)',
                      transition: '.3s', borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute', content: '""', height: '18px', width: '18px', left: whatsappAlerts ? '26px' : '4px', bottom: '4px',
                        backgroundColor: 'white', transition: '.3s', borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Sends instant WhatsApp alerts with markdown details directly to your mobile number.
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>WhatsApp Contact Number (with country code)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  disabled={testingWhatsApp || !whatsappAlerts}
                  className="btn btn-secondary"
                  style={{ height: '36px', fontSize: '0.8rem', marginTop: '0.25rem', borderColor: 'rgba(34, 197, 94, 0.4)', color: '#22c55e' }}
                >
                  {testingWhatsApp ? <ButtonLoader text="Sending Test WhatsApp..." /> : <><Send size={14} /> Send Test WhatsApp</>}
                </button>
              </div>

            </div>
          </div>

          {/* ⏰ SECTION 2: Daily Scheduled Delivery Time */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <Clock size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Daily Scheduled Alert Time</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '220px' }}>
                <label className="form-label">Alert Trigger Time (24h / AM-PM)</label>
                <input
                  type="time"
                  className="form-input"
                  value={dailyAlertTime}
                  onChange={(e) => setDailyAlertTime(e.target.value)}
                  style={{ height: '42px', fontSize: '1.1rem', fontWeight: '700' }}
                  required
                />
              </div>

              <div style={{ flex: 1, minWidth: '260px', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                MedScan AI background scheduler inspects inventory daily and automatically dispatches active alerts at <strong>{dailyAlertTime}</strong>.
              </div>

              <button
                type="button"
                onClick={handleRunScanNow}
                disabled={runningCheck}
                className="btn btn-secondary"
                style={{ height: '42px', fontSize: '0.85rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}
                title="Run daily inspection right now"
              >
                {runningCheck ? <div className="spinner" /> : <><RefreshCw size={16} /> Run Alert Scan Now</>}
              </button>
            </div>

            {lastScanResult && (
              <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                  📊 Scan Execution Details:
                </div>
                <div>• Time Executed: <strong>{new Date(lastScanResult.timestamp).toLocaleTimeString()}</strong></div>
                <div>• Total User Accounts Scanned: <strong>{lastScanResult.userCount || 1}</strong></div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                  Single daily delivery rule enforced: Items already delivered today are skipped to avoid duplicate spam.
                </div>
              </div>
            )}
          </div>

          {/* 🔔 SECTION 3: Expiry & Low Stock Triggers */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Alert Triggers & Thresholds</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              
              {/* Expiry Milestones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Medicine Expiry Alerts</span>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '42px', height: '22px' }}>
                    <input 
                      type="checkbox" 
                      checked={expiryEnabled} 
                      onChange={(e) => setExpiryEnabled(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: expiryEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      transition: '.3s', borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute', content: '""', height: '14px', width: '14px', left: expiryEnabled ? '24px' : '4px', bottom: '4px',
                        backgroundColor: 'white', transition: '.3s', borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Select the advance milestone days to trigger alerts:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem 0' }}>
                  {[
                    { day: 30, label: '30 days before expiry' },
                    { day: 10, label: '10 days before expiry' },
                    { day: 5, label: '5 days before expiry' },
                    { day: 1, label: '1 day before expiry (Expiring tomorrow)' },
                    { day: 0, label: 'Expired today or earlier' }
                  ].map(({ day, label }) => (
                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={!!milestones[day]}
                        onChange={() => handleMilestoneToggle(day)}
                        disabled={!expiryEnabled}
                        style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Low Stock Safety Threshold */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Low Stock Alerts</span>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '42px', height: '22px' }}>
                    <input 
                      type="checkbox" 
                      checked={lowStockEnabled} 
                      onChange={(e) => setLowStockEnabled(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: lowStockEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      transition: '.3s', borderRadius: '34px'
                    }}>
                      <span style={{
                        position: 'absolute', content: '""', height: '14px', width: '14px', left: lowStockEnabled ? '24px' : '4px', bottom: '4px',
                        backgroundColor: 'white', transition: '.3s', borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Sends once-daily replenishment alerts while stock remains below threshold:
                </div>

                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Safety Stock Threshold (Units)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    min="1"
                    max="1000"
                    disabled={!lowStockEnabled}
                    style={{ height: '40px' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Triggers daily Gmail & WhatsApp notices when quantity &le; {lowStockThreshold} units.
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Save Settings Button */}
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ height: '46px', fontWeight: '700', fontSize: '0.95rem' }}
          >
            {saving ? <ButtonLoader text="Saving Alert Settings..." /> : <><Save size={18} /> Save Alert Settings</>}
          </button>

        </form>
      )}

    </div>
  );
};

export default Notifications;
