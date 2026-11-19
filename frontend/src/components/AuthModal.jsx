import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, updateUserProfile } from '../api/client';
import { useToast } from './Toast';

export default function AuthModal({
  isOpen,
  initialMode = 'login', // 'login', 'signup', or 'profile'
  onClose,
  onAuthSuccess,
  currentUser = null
}) {
  const toast = useToast();
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup' or 'profile'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [identifierType, setIdentifierType] = useState('email'); // 'email' or 'phone'
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Profile / Onboarding State
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('Working Professional');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('Computer Science & AI');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Sync mode and prefill when opened or when currentUser changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      if (currentUser && (initialMode === 'profile' || mode === 'profile')) {
        setFullName(currentUser.username || '');
        setProfession(currentUser.profession || 'Working Professional');
        setInstitution(currentUser.institution || '');
        setDepartment(currentUser.department || 'Computer Science & AI');
        setEmailInput(currentUser.email || '');
        setPhoneInput(currentUser.phoneNumber || '');
      } else {
        setIdentifier('');
        setPassword('');
        setFullName('');
        setInstitution('');
      }
    }
  }, [isOpen, initialMode, currentUser]);

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your registered email address or mobile number.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await loginUser({
        identifier: identifier.trim(),
        password: password.trim()
      });
      const user = response.user || response;
      toast.success(`Welcome back, ${user.username || 'Researcher'}!`);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Invalid credentials. Please verify your email/phone and password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Demo Login
  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await loginUser({
        identifier: 'researcher@researchscope.edu',
        password: 'demo'
      });
      const user = response.user || response;
      toast.success(`Signed in as Demo Researcher (${user.username})`);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err) {
      console.error('Demo login error:', err);
      setErrorMessage(err.message || 'Failed to sign in with demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration Submit (1st Time Sign Up)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const primaryContact = identifierType === 'email' ? emailInput.trim() : phoneInput.trim();

    if (!primaryContact) {
      setErrorMessage(`Please enter a valid ${identifierType === 'email' ? 'email address' : 'mobile phone number'}.`);
      return;
    }
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name or title.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        email: identifierType === 'email' ? emailInput.trim() : '',
        phoneNumber: identifierType === 'phone' ? phoneInput.trim() : '',
        username: fullName.trim(),
        password: password.trim(),
        profession: profession || 'Working Professional',
        institution: institution.trim() || 'Academic / Corporate Organization',
        department: department.trim() || 'Research & Development'
      };

      const response = await registerUser(payload);
      const user = response.user || response;
      toast.success(`Account created successfully! Welcome to ResearchScope, ${user.username}.`);
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage(err.message || 'Failed to create account. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Profile Update Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const updated = await updateUserProfile({
        username: fullName.trim(),
        profession: profession,
        institution: institution.trim(),
        department: department.trim(),
        phoneNumber: phoneInput.trim()
      });
      toast.success('Profile updated successfully.');
      if (onAuthSuccess) onAuthSuccess(updated);
      onClose();
    } catch (err) {
      console.error('Profile update error:', err);
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const professionsList = [
    { value: 'Working Professional', label: 'Working Professional / Industry Researcher' },
    { value: 'Academic Faculty', label: 'Academic Faculty / Professor / Lecturer' },
    { value: 'Postdoctoral Fellow', label: 'Postdoctoral Fellow' },
    { value: 'PhD Scholar', label: 'PhD Scholar / Doctoral Student' },
    { value: 'Graduate Student', label: 'Graduate Student (Master\'s / Postgraduate)' },
    { value: 'Undergraduate Student', label: 'Undergraduate Student (Bachelor\'s)' },
    { value: 'Independent Researcher', label: 'Independent Researcher / Scholar' },
    { value: 'Other', label: 'Other Scholarly Role' }
  ];

  const domainsList = [
    'Computer Science & AI',
    'Biomedical & Health Sciences',
    'Physics & Quantum Materials',
    'Engineering & Robotics',
    'Social Sciences & Economics',
    'Environmental & Earth Sciences',
    'Mathematics & Statistics',
    'Chemistry & Materials Science'
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '94%',
          padding: 0,
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-skeuo-modal)',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px 16px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'linear-gradient(180deg, var(--bg-surface-elevated) 0%, var(--bg-surface) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)'
              }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Academic Authentication
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              {mode === 'profile' ? 'Scholarly Profile & Role' : mode === 'login' ? 'Sign In to ResearchScope' : 'Create Scholarly Account'}
            </h2>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {mode === 'profile' 
                ? 'Manage your academic affiliation, role, and research specialization'
                : mode === 'login' 
                  ? 'Access your saved literature, annotated bibliographies, and workspaces' 
                  : 'Join researchers, faculty, and students across global research institutes'}
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ width: '32px', height: '32px', padding: 0, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Tab Switcher (Log In vs Sign Up) - Hidden in Profile mode */}
        {mode !== 'profile' && (
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-main)',
            borderBottom: '1px solid var(--border-color)',
            padding: '4px 6px'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '13px',
                fontWeight: mode === 'login' ? 700 : 500,
                color: mode === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
                backgroundColor: mode === 'login' ? 'var(--bg-surface)' : 'transparent',
                border: mode === 'login' ? '1px solid var(--border-color)' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In (Existing User)
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '13px',
                fontWeight: mode === 'signup' ? 700 : 500,
                color: mode === 'signup' ? 'var(--text-main)' : 'var(--text-muted)',
                backgroundColor: mode === 'signup' ? 'var(--bg-surface)' : 'transparent',
                border: mode === 'signup' ? '1px solid var(--border-color)' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Sign Up (1st Time User)
            </button>
          </div>
        )}

        {/* Error Notification Alert */}
        {errorMessage && (
          <div style={{
            margin: '16px 24px 0 24px',
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            fontSize: '12.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '15px' }}>!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '20px 24px 24px 24px' }}>
          
          {/* ========================================================== */}
          {/* TAB 1: LOG IN (RETURNING USER)                             */}
          {/* ========================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Email Address or Mobile Number
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', height: '42px', fontSize: '13.5px' }}
                  placeholder="e.g. researcher@stanford.edu or +1 555 019 2831"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoFocus
                  required
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Enter the email address or phone number associated with your account
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--accent)', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="search-input"
                  style={{ width: '100%', height: '42px', fontSize: '13.5px' }}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('For credential recovery, please contact your institutional administrator or re-register.')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ height: '44px', fontSize: '14px', fontWeight: 700, width: '100%', marginTop: '4px' }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>or quick demo</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
              </div>

              {/* Instant Demo Login Button */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                style={{ height: '38px', fontSize: '12.5px', fontWeight: 600, width: '100%' }}
              >
                Sign In as Demo Researcher (Dr. Elena Vance • Stanford)
              </button>

              <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                First time using ResearchScope?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMessage(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Create an account
                </button>
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* TAB 2: SIGN UP (NEW USER / ONBOARDING)                     */}
          {/* ========================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Identifier Type Choice (Email vs Mobile) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Sign Up Method
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${identifierType === 'email' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setIdentifierType('email')}
                    style={{ flex: 1 }}
                  >
                    Use Email ID
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${identifierType === 'phone' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setIdentifierType('phone')}
                    style={{ flex: 1 }}
                  >
                    Use Mobile Number
                  </button>
                </div>
              </div>

              {/* Primary Contact Input */}
              {identifierType === 'email' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Institutional or Personal Email
                  </label>
                  <input
                    type="email"
                    className="search-input"
                    style={{ width: '100%', height: '40px', fontSize: '13px' }}
                    placeholder="e.g. alex.chen@mit.edu or alex@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Mobile Phone Number (with Country Code)
                  </label>
                  <input
                    type="tel"
                    className="search-input"
                    style={{ width: '100%', height: '40px', fontSize: '13px' }}
                    placeholder="e.g. +1 (555) 234-5678 or +91 98765 43210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              )}

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Full Name & Scholarly Title
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', height: '40px', fontSize: '13px' }}
                  placeholder="e.g. Dr. Alex Chen or Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Create Password (minimum 6 characters)
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="search-input"
                  style={{ width: '100%', height: '40px', fontSize: '13px' }}
                  placeholder="Set your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Profession / Role Selection (Crucial User Requirement) */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Profession / Academic Role
                </label>
                <select
                  className="search-input"
                  style={{ width: '100%', height: '40px', fontSize: '13px', cursor: 'pointer' }}
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  required
                >
                  {professionsList.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Institution / Organization */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Affiliation / University / Organization
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', height: '40px', fontSize: '13px' }}
                  placeholder="e.g. Stanford University, Google DeepMind, IIT Bombay, Self-Employed"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>

              {/* Primary Research Field */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Primary Research Field / Department
                </label>
                <select
                  className="search-input"
                  style={{ width: '100%', height: '40px', fontSize: '13px', cursor: 'pointer' }}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {domainsList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ height: '44px', fontSize: '14px', fontWeight: 700, width: '100%', marginTop: '6px' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Complete Registration & Sign In'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* TAB 3: PROFILE & ROLE MANAGEMENT                           */}
          {/* ========================================================== */}
          {mode === 'profile' && (
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Full Name & Title
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', height: '40px', fontSize: '13px' }}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Profession / Academic Role
                </label>
                <select
                  className="search-input"
                  style={{ width: '100%', height: '40px', fontSize: '13px', cursor: 'pointer' }}
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                >
                  {professionsList.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Institution / Organization
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', height: '40px', fontSize: '13px' }}
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Primary Department / Research Field
                </label>
                <select
                  className="search-input"
                  style={{ width: '100%', height: '40px', fontSize: '13px', cursor: 'pointer' }}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {domainsList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  className="search-input"
                  style={{ width: '100%', height: '40px', fontSize: '13px' }}
                  placeholder="+1 (555) 000-0000"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, height: '40px', fontSize: '13px', fontWeight: 700 }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  style={{ height: '40px', fontSize: '13px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
