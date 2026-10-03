import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  ArrowLeft,
  Star,
  Activity,
  KeyRound,
  X,
  AlertOctagon
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { resetPassword } from '../services/auth';
import FormLoadingOverlay from '../components/FormLoadingOverlay';
import ButtonLoader from '../components/ButtonLoader';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState(location.state?.registeredPassword || '');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.successMessage || '');
  const [loading, setLoading] = useState(false);

  // Sync autofill when navigating from successful registration
  useEffect(() => {
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail);
    }
    if (location.state?.registeredPassword) {
      setPassword(location.state.registeredPassword);
    }
    if (location.state?.successMessage) {
      setSuccessMsg(location.state.successMessage);
    }
  }, [location.state]);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error("Email Login Error:", err);
      const errMsg = err.message || 'Login failed. Please verify your credentials.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setSuccessMsg('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('pharmacist@medscan.ai');
    setPassword('password123');
    setError('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotStatus(null);

    try {
      const res = await resetPassword(forgotEmail.trim());
      setForgotStatus({
        type: 'success',
        text: res.message || 'Password reset instructions dispatched to your email.'
      });
    } catch (err) {
      setForgotStatus({
        type: 'error',
        text: err.message || 'Failed to dispatch reset link. Verify email address.'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* 🌌 Background Spotlights */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '20%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 65%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-120px',
        right: '15%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      {/* 🛡️ Split-Screen Enterprise Card */}
      <div className="auth-split-wrapper fade-in">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: BRAND & PLATFORM SHOWCASE */}
        {/* ======================================================== */}
        <div className="auth-showcase">
          {/* Top Brand Bar */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                overflow: 'hidden'
              }}>
                <img src="/src/assets/images/pill_logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>MediTrack</span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                    color: '#fff',
                    padding: '0.12rem 0.45rem',
                    borderRadius: '9999px'
                  }}>
                    AI
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Enterprise Pharmacy Operating System
                </div>
              </div>
            </div>

            <h2 style={{
              fontSize: '1.95rem',
              fontWeight: '800',
              lineHeight: '1.25',
              letterSpacing: '-0.02em',
              color: '#fff',
              marginBottom: '1rem'
            }}>
              Real-Time Pharmacy Intelligence & Neural Telemetry.
            </h2>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
              Automate packaging intake with sub-second vision OCR, prevent stockout losses with Scikit-Learn forecasts, and streamline dispensary invoicing.
            </p>

            {/* Feature Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="auth-feature-pill">
                <Cpu size={18} color="#38bdf8" />
                <span><strong>EasyOCR Neural Vision:</strong> Sub-second packaging & barcode recognition</span>
              </div>
              <div className="auth-feature-pill">
                <Activity size={18} color="#10b981" />
                <span><strong>Sales Demand Forecasts:</strong> Linear regression volume modeling</span>
              </div>
              <div className="auth-feature-pill">
                <ShieldCheck size={18} color="#a78bfa" />
                <span><strong>Zero-Loss Surveillance:</strong> Automated Gmail & WhatsApp expiry notices</span>
              </div>
            </div>
          </div>

          {/* Testimonial Quote & Compliance Footer */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="auth-quote-card">
              <div style={{ display: 'flex', gap: '3px', color: '#f59e0b', marginBottom: '0.45rem' }}>
                <Star size={14} fill="#f59e0b" />
                <Star size={14} fill="#f59e0b" />
                <Star size={14} fill="#f59e0b" />
                <Star size={14} fill="#f59e0b" />
                <Star size={14} fill="#f59e0b" />
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: '1.5', margin: 0 }}>
                "MediTrack AI cut our manual inventory intake time by 85% and gave our dispensary flawless batch expiration surveillance."
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '500' }}>
                Dr. Arvind Raman • Head of Clinical Pharmacy
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              padding: '0.25rem 0.5rem'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                256-Bit TLS Encrypted
              </span>
              <span>HIPAA Compliant Architecture</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: LOGIN FORM PANEL */}
        {/* ======================================================== */}
        <div className="auth-form-panel">
          <FormLoadingOverlay 
            active={loading} 
            title="Authenticating Pharmacist" 
            subtitle="Verifying dispensary credentials and opening secure session..." 
            badge="Security Gateway" 
          />

          {/* Back to Home Link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
            <Link 
              to="/" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-secondary)',
                fontSize: '0.825rem',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <ArrowLeft size={15} /> Back to Home
            </Link>

            {/* Quick Demo Autofill Badge */}
            <button 
              type="button" 
              onClick={handleQuickDemoFill}
              className="demo-badge-btn"
              title="Click to automatically fill credentials for testing"
            >
              <Zap size={12} />
              <span>Fill Demo Account</span>
            </button>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: '#60a5fa',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '0.75rem'
            }}>
              <ShieldCheck size={13} />
              <span>Staff Verification Portal</span>
            </div>
            
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              Sign In to Console
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Enter your registered staff credentials to access live dispensary telemetry
            </p>
          </div>

          {/* Banners */}
          {successMsg && (
            <div style={{
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <AlertOctagon size={18} style={{ flexShrink: 0, color: '#ef4444' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            
            {/* Email Address */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.825rem' }}>Work Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="pharmacist@medscan.ai"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  style={{ paddingLeft: '2.5rem', height: '42px', fontSize: '0.9rem' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ 
                  fontWeight: '600', 
                  fontSize: '0.825rem',
                  color: error && error.toLowerCase().includes('password') ? '#ef4444' : undefined
                }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: error && error.toLowerCase().includes('password') ? '#ef4444' : 'var(--text-muted)' 
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  style={{ 
                    paddingLeft: '2.5rem', 
                    paddingRight: '2.5rem', 
                    height: '42px', 
                    fontSize: '0.9rem',
                    borderColor: error && error.toLowerCase().includes('password') ? '#ef4444' : undefined,
                    boxShadow: error && error.toLowerCase().includes('password') ? '0 0 0 1px #ef4444' : undefined
                  }}
                  required
                />
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '15px', height: '15px' }}
                />
                <span>Remember session on this dispensary terminal</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                height: '46px',
                fontWeight: '700',
                fontSize: '0.95rem',
                marginTop: '0.25rem',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
              }}
            >
              {loading ? (
                <ButtonLoader text="Verifying Credentials..." />
              ) : (
                <>Sign In to Console <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1.4rem 0', color: 'var(--text-muted)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
            <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Or verify with
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          </div>

          {/* Google Workspace Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-secondary"
            style={{
              width: '100%',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.16-4.53z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google Workspace
          </button>

          {/* Registration Redirect Link */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            New to the dispensary team?{' '}
            <Link to="/register" style={{ color: '#38bdf8', fontWeight: '700', textDecoration: 'none' }}>
              Create Staff Account →
            </Link>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 🔑 FORGOT PASSWORD MODAL */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="glass-card fade-in" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={() => { setShowForgotModal(false); setForgotStatus(null); }}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>Reset Staff Password</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                  We'll dispatch a secure recovery link to your work email
                </p>
              </div>
            </div>

            {forgotStatus && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: forgotStatus.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${forgotStatus.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: forgotStatus.type === 'success' ? '#22c55e' : '#f87171',
                fontSize: '0.825rem',
                marginBottom: '1rem'
              }}>
                {forgotStatus.text}
              </div>
            )}

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Registered Work Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="pharmacist@medscan.ai"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(false); setForgotStatus(null); }}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail.trim()}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                  {forgotLoading ? <ButtonLoader text="Sending Link..." /> : 'Send Recovery Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
