import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, UserCheck, LogIn } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import FormLoadingOverlay from '../components/FormLoadingOverlay';
import ButtonLoader from '../components/ButtonLoader';
import AuthNotification from '../components/AuthNotification';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [popup, setPopup] = useState(null);

  const triggerShake = () => {
    setShake(false);
    setTimeout(() => setShake(true), 15);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 1. Check if all fields are empty
    if (!trimmedName && !trimmedEmail && !trimmedPassword) {
      setFieldErrors({ name: true, email: true, password: true });
      setPopup({
        type: 'warning',
        title: 'Please Fill In All Details!',
        message: 'Full name, email address, and password are all required to register a staff account.'
      });
      triggerShake();
      return;
    }

    // 2. Check full name
    if (!trimmedName) {
      setFieldErrors({ name: true, email: false, password: false });
      setPopup({
        type: 'warning',
        title: 'Full Name Required!',
        message: 'Please enter your full name (staff or pharmacist name).'
      });
      triggerShake();
      return;
    }

    if (trimmedName.length < 2) {
      setFieldErrors({ name: true, email: false, password: false });
      setPopup({
        type: 'warning',
        title: 'Invalid Name!',
        message: 'Full name must contain at least 2 characters.'
      });
      triggerShake();
      return;
    }

    // 3. Check email
    if (!trimmedEmail) {
      setFieldErrors({ name: false, email: true, password: false });
      setPopup({
        type: 'warning',
        title: 'Email Address Required!',
        message: 'Please enter a valid email address for your staff account.'
      });
      triggerShake();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFieldErrors({ name: false, email: true, password: false });
      setPopup({
        type: 'warning',
        title: 'Invalid Email Format!',
        message: 'Please enter a valid email address (e.g. alex@medscan.ai).'
      });
      triggerShake();
      return;
    }

    // 4. Check password
    if (!trimmedPassword) {
      setFieldErrors({ name: false, email: false, password: true });
      setPopup({
        type: 'warning',
        title: 'Password Required!',
        message: 'Please create a secure password for your account.'
      });
      triggerShake();
      return;
    }

    if (password.length < 6) {
      setFieldErrors({ name: false, email: false, password: true });
      setPopup({
        type: 'warning',
        title: 'Password Too Short!',
        message: 'Password must be at least 6 characters long to meet security standards.'
      });
      triggerShake();
      return;
    }

    // Clear validation state
    setFieldErrors({});
    setPopup(null);
    setLoading(true);

    try {
      await register(trimmedName, trimmedEmail, password, 'pharmacist');
      navigate('/login', {
        state: {
          successMessage: 'Account registered successfully! Please sign in with your credentials.',
          registeredEmail: trimmedEmail
        }
      });
    } catch (err) {
      console.error("Registration Error:", err);
      triggerShake();

      const errCode = err.code || '';
      const errMsg = err.message || '';

      if (
        errCode === 'auth/email-already-in-use' ||
        errMsg.toLowerCase().includes('already registered') ||
        errMsg.toLowerCase().includes('already in use')
      ) {
        setFieldErrors({ email: true });
        setPopup({
          type: 'warning',
          title: 'Email Already Registered!',
          message: 'An account with this email address already exists. Please sign in instead of registering again.',
          actionText: 'Sign In Now',
          onAction: () => navigate('/login', { state: { registeredEmail: trimmedEmail } })
        });
      } else {
        setPopup({
          type: 'error',
          title: 'Registration Failed',
          message: errMsg || 'Could not complete registration. Please verify details and try again.'
        });
      }
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
      background: 'radial-gradient(circle at top left, rgba(139, 92, 246, 0.15), transparent 40%), var(--bg-primary)',
      padding: '1.5rem'
    }}>
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <FormLoadingOverlay 
          active={loading} 
          title="Registering Staff Account" 
          subtitle="Creating credentials & configuring pharmacy console permissions..." 
          badge="Staff Gateway" 
        />

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #8b5cf6, var(--primary))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: '0.75rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Register your MedScan AI staff account
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
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: fieldErrors.name ? 'var(--danger)' : 'var(--text-muted)' 
              }} />
              <input
                type="text"
                className={`form-input ${fieldErrors.name ? 'form-input-error' : ''}`}
                placeholder="Dr. Alex Morgan"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: false }));
                }}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

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
                placeholder="alex@medscan.ai"
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
                placeholder="•••••••• (min. 6 characters)"
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
              <ButtonLoader text="Creating Account..." />
            ) : (
              <>Register Account <UserCheck size={18} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <LogIn size={14} /> Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
