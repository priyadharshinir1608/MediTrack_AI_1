import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowLeft,
  Star,
  Activity,
  Briefcase,
  Boxes,
  Cpu,
  Receipt
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import FormLoadingOverlay from '../components/FormLoadingOverlay';
import ButtonLoader from '../components/ButtonLoader';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic Password Strength Calculator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, text: 'Empty', color: '#64748b', percent: 0 };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: 'Weak', color: '#ef4444', percent: 25 };
      case 2:
        return { score: 2, text: 'Fair', color: '#f59e0b', percent: 50 };
      case 3:
        return { score: 3, text: 'Good', color: '#38bdf8', percent: 75 };
      case 4:
      default:
        return { score: 4, text: 'Strong', color: '#10b981', percent: 100 };
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Pharmacy Data Protection and Security Protocol.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password, 'pharmacist');
      navigate('/login', {
        state: {
          successMessage: 'Account registered successfully! Welcome to MediTrack AI.',
          registeredEmail: email.trim(),
          registeredPassword: password
        }
      });
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error("Google Signup Error:", err);
      setError(err.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
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

      {/* 🌌 Ambient Radial Glows */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        right: '20%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, transparent 65%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-120px',
        left: '15%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.14) 0%, transparent 60%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      {/* 🛡️ Split-Screen Enterprise Card */}
      <div className="auth-split-wrapper fade-in">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: BRAND & ONBOARDING VALUE SHOWCASE */}
        {/* ======================================================== */}
        <div className="auth-showcase" style={{
          background: 'linear-gradient(145deg, rgba(88, 28, 135, 0.35) 0%, rgba(15, 23, 42, 0.95) 75%), radial-gradient(circle at top left, rgba(139, 92, 246, 0.3) 0%, transparent 60%)'
        }}>
          {/* Top Brand Bar */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
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
                    background: 'linear-gradient(135deg, #818cf8, #38bdf8)',
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
              Join the Next-Generation AI Pharmacy Network.
            </h2>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
              Equip your pharmacy with real-time neural OCR intake, automated point-of-sale customer billing, and round-the-clock stock expiration protection.
            </p>

            {/* Feature Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="auth-feature-pill">
                <Cpu size={18} color="#c084fc" />
                <span><strong>Instant Setup:</strong> Zero-configuration catalog and barcode ingestion</span>
              </div>
              <div className="auth-feature-pill">
                <Receipt size={18} color="#34d399" />
                <span><strong>Smart Billing Engine:</strong> Automated stock decrement & Gmail receipts</span>
              </div>
              <div className="auth-feature-pill">
                <ShieldCheck size={18} color="#60a5fa" />
                <span><strong>Role-Based Access:</strong> Pharmacist, Chemist & Management controls</span>
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
                "Onboarding our staff was frictionless. We scanned our first 50 medicine blister batches within 10 minutes of account creation."
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '500' }}>
                Sarah Jenkins • Senior Pharmacist & Inventory Lead
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
                MongoDB Atlas Synced
              </span>
              <span>Encrypted Session Vault</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: REGISTRATION FORM PANEL */}
        {/* ======================================================== */}
        <div className="auth-form-panel">
          <FormLoadingOverlay 
            active={loading} 
            title="Registering Staff Profile" 
            subtitle="Configuring permissions & initializing dispensary session..." 
            badge="Staff Gateway" 
          />

          {/* Back to Home Link */}
          <div style={{ marginBottom: '1.5rem' }}>
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
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              color: '#c084fc',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '0.75rem'
            }}>
              <UserCheck size={13} />
              <span>Staff Onboarding Portal</span>
            </div>
            
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              Create Staff Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Configure your credentials to manage inventory, POS billing & telemetry
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.825rem' }}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Dr. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem', height: '42px', fontSize: '0.875rem' }}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.825rem' }}>Work Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="alex.morgan@medscan.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem', height: '42px', fontSize: '0.875rem' }}
                  required
                />
              </div>
            </div>

            {/* Password with Strength Meter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.825rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Create Password *</span>
                {password && (
                  <span style={{ color: passwordStrength.color, fontWeight: '700', fontSize: '0.78rem' }}>
                    {passwordStrength.text}
                  </span>
                )}
              </label>

              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="•••••••••••• (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: '42px', fontSize: '0.875rem' }}
                  required
                  minLength={6}
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

              {/* Strength Meter Bar */}
              {password && (
                <div className="pwd-strength-track">
                  <div 
                    className="pwd-strength-indicator" 
                    style={{ 
                      width: `${passwordStrength.percent}%`, 
                      backgroundColor: passwordStrength.color 
                    }} 
                  />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.825rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Confirm Password *</span>
                {confirmPassword && (
                  <span style={{ 
                    color: password === confirmPassword ? '#10b981' : '#ef4444', 
                    fontWeight: '700', 
                    fontSize: '0.78rem' 
                  }}>
                    {password === confirmPassword ? '✓ Passwords Match' : '⚠ Mismatch'}
                  </span>
                )}
              </label>

              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ 
                    paddingLeft: '2.5rem', 
                    paddingRight: '2.5rem', 
                    height: '42px', 
                    fontSize: '0.875rem',
                    borderColor: confirmPassword && password !== confirmPassword ? '#ef4444' : undefined
                  }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="auth-pwd-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms & Data Protection Agreement */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', cursor: 'pointer', lineHeight: '1.4' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer', marginTop: '2px', width: '15px', height: '15px' }}
                />
                <span>
                  I agree to the <strong>Pharmacy Data Protection Protocol</strong>, HIPAA compliance standards, and automated telemetry alerts.
                </span>
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
                marginTop: '0.35rem',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
              }}
            >
              {loading ? (
                <ButtonLoader text="Creating Staff Account..." />
              ) : (
                <>Complete Staff Registration <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: 'var(--text-muted)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
            <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Or register with
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          </div>

          {/* Google Workspace Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="btn btn-secondary"
            style={{
              width: '100%',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.16-4.53z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Sign up with Google Workspace
          </button>

          {/* Sign In Redirect Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Already registered on this terminal?{' '}
            <Link to="/login" style={{ color: '#c084fc', fontWeight: '700', textDecoration: 'none' }}>
              Sign In to Console →
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Register;
