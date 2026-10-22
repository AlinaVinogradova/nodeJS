import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, User, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && !formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isRegister) {
        await register(formData.name, formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for quick demo testing
  const handleFillDemo = () => {
    setFormData({
      name: 'Demo Account',
      email: 'demo@crm.local',
      password: 'demopassword123'
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Banner */}
        <div className="auth-header">
          <div className="auth-brand-icon">
            <Building2 size={28} className="text-primary" />
          </div>
          <h1 className="auth-title">LeadPulse CRM</h1>
          <p className="auth-subtitle">
            Log contacted businesses, advance deals through stages, and stay on top of follow-up reminders
          </p>
        </div>

        {/* Tab switch */}
        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setError(''); }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-error-alert">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Jane Miller"
                  value={formData.name}
                  onChange={handleChange}
                  required={isRegister}
                  autoFocus={isRegister}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="e.g. sales@yourcompany.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus={!isRegister}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <span className="field-hint">Minimum 6 characters</span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isRegister ? 'Sign Up & Get Started' : 'Log In to Workspace'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Quick Demo Helper */}
          <div className="auth-footer-helper">
            <button 
              type="button" 
              className="btn-link-demo"
              onClick={handleFillDemo}
            >
              <Sparkles size={14} />
              <span>Fill sample credentials</span>
            </button>
          </div>
        </form>

        <div className="auth-perks">
          <div className="perk-item">
            <CheckCircle2 size={14} className="text-emerald" />
            <span>Pipeline stage tracking</span>
          </div>
          <div className="perk-item">
            <CheckCircle2 size={14} className="text-emerald" />
            <span>Automated follow-up alerts</span>
          </div>
          <div className="perk-item">
            <CheckCircle2 size={14} className="text-emerald" />
            <span>Stage analytics & search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
