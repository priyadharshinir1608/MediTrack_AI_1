import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import FormLoadingOverlay from '../components/FormLoadingOverlay';
import ButtonLoader from '../components/ButtonLoader';
import AuthNotification from '../components/AuthNotification';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [popup, setPopup] = useState(null);

  // If redirected with success message from Registration
  useEffect(() => {
    if (location.state?.successMessage) {
      setPopup({
        type: 'success',
        title: 'Registration Successful! 🎉',
        message: location.state.successMessage
      });
    }
  }, [location.state]);

  const triggerShake = () => {
    setShake(false);
    setTimeout(() => setShake(true), 15);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 1. Check if both fields are empty
    if (!trimmedEmail && !trimmedPassword) {
      setFieldErrors({ email: true, password: true });
      setPopup({
        type: 'warning',
        title: 'Please Fill In All Details!',
        message: 'Both email address and password are required. Please enter your credentials to log in.'
      });
      triggerShake();
      return;
    }

    // 2. Check if email is empty
    if (!trimmedEmail) {
      setFieldErrors({ email: true, password: false });
      setPopup({
        type: 'warning',
        title: 'Email Address Required!',
        message: 'Please enter your registered staff email address.'
      });
      triggerShake();
      return;
    }

    // 3. Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFieldErrors({ email: true, password: false });
      setPopup({
        type: 'warning',
        title: 'Invalid Email Format!',
        message: 'Please enter a valid email address (e.g. pharmacist@medscan.ai).'
      });
      triggerShake();
      return;
    }

    // 4. Check if password is empty
    if (!trimmedPassword) {
      setFieldErrors({ email: false, password: true });
      setPopup({
        type: 'warning',
        title: 'Password Required!',
        message: 'Please enter your account password to sign in.'
      });
      triggerShake();
      return;
    }

    // Clear validation warnings
    setFieldErrors({});
    setPopup(null);
    setLoading(true);

    try {
      await login(trimmedEmail, trimmedPassword);
      navigate('/dashboard');
    } catch (err) {
      console.error("Email Login Error:", err);
      triggerShake();

      const errCode = err.code || '';
      const errMsg = err.message || '';

      // Strict enforcement: Unregistered user must register first
      if (
        errCode === 'auth/user-not-found' ||
        errCode === 'auth/invalid-credential' ||
        errMsg.toLowerCase().includes('not registered') ||
        errMsg.toLowerCase().includes('no pharmacy staff account found')
      ) {
        setFieldErrors({ email: true, password: true });
        setPopup({
          type: 'error',
          title: 'Account Not Registered!',
          message: 'No registered pharmacy staff account was found with this email. You cannot log in without registering first!',
          actionText: 'Register New Account',
          onAction: () => navigate('/register', { state: { email: trimmedEmail } })
        });
      } else if (errCode === 'auth/wrong-password') {
        setFieldErrors({ email: false, password: true });
        setPopup({
          type: 'error',
          title: 'Incorrect Password!',
          message: 'The password you entered is incorrect. Please verify and try again.'
        });
      } else if (errCode === 'auth/too-many-requests') {
        setPopup({
          type: 'error',
          title: 'Access Temporarily Suspended',
          message: 'Too many failed login attempts. Access is temporarily restricted. Please wait a few moments before trying again.'
        });
      } else {
        setPopup({
          type: 'error',
          title: 'Authentication Failed',
          message: errMsg || 'Login failed. Please verify your credentials and try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setFieldErrors({});
      setPopup(null);
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error("Google Login Error:", err);
      triggerShake();
      setPopup({
        type: 'error',
        title: 'Google Sign-In Failed',
        message: err.message || 'An unexpected error occurred during Google sign-in.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 40%), var(--bg-primary)',
      padding: '1.5rem'
    }}>
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <FormLoadingOverlay 
          active={loading} 
          title="Authenticating Pharmacist" 
          subtitle="Verifying credentials and opening secure session..." 
          badge="Security Gateway" 
        />
        
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: '0.75rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Sign in to MedScan AI Pharmacy Console
          </p>
        </div>

        {/* 🔔 Dynamic Popup Notification */}
        {popup && (
          <AuthNotification
            type={popup.type}
            title={popup.title}
            message={popup.message}
            actionText={popup.actionText}
            onAction={popup.onAction}
            onClose={() => setPopup(null)}
            shake={shake}
          />
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: fieldErrors.email ? 'var(--danger)' : 'var(--text-muted)' 
              }} />
              <input
                type="email"
                className={`form-input ${fieldErrors.email ? 'form-input-error' : ''}`}
                placeholder="pharmacist@medscan.ai"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: false }));
                }}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: fieldErrors.password ? 'var(--danger)' : 'var(--text-muted)' 
              }} />
              <input
                type="password"
                className={`form-input ${fieldErrors.password ? 'form-input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: false }));
                }}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', height: '44px' }}
          >
            {loading ? (
              <ButtonLoader text="Signing in..." />
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--text-muted)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          <span style={{ padding: '0 0.75rem', fontSize: '0.8rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>

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
            fontWeight: '600'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-6.16-4.53z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <UserPlus size={14} /> Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
