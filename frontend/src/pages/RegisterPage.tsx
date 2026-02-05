import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    fullName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let message = '';
    let color = '';

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        message = 'Very Weak';
        color = '#f87171';
        break;
      case 2:
        message = 'Weak';
        color = '#fbbf24';
        break;
      case 3:
        message = 'Medium';
        color = '#60a5fa';
        break;
      case 4:
        message = 'Strong';
        color = '#4ade80';
        break;
      case 5:
        message = 'Very Strong';
        color = '#22c55e';
        break;
    }

    setPasswordStrength({ score, message, color });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength.score < 4) {
      setError('Password is not strong enough. Please use a stronger password.');
      setLoading(false);
      return;
    }

    try {
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber
      });

      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="text-gradient">📝 Register</h1>
            <p>Create your secure account</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="johndoe"
                pattern="[a-zA-Z0-9_]{3,20}"
                title="3-20 characters, letters, numbers, and underscores only"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className="form-input"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="client">Client</option>
                <option value="lawyer">Lawyer</option>
              </select>
              <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)', 
                marginTop: '0.5rem',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {formData.role === 'client' && '• Read-only access to assigned cases'}
                {formData.role === 'lawyer' && '• Full case management and document signing'}
              </p>
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#fbbf24', 
                marginTop: '0.5rem',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                ℹ️ Admin accounts can only be created by existing administrators
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter strong password"
              />
              {formData.password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{
                    height: '4px',
                    background: '#333',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      height: '100%',
                      background: passwordStrength.color,
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    color: passwordStrength.color,
                    marginTop: '0.25rem',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    Strength: {passwordStrength.message}
                  </p>
                </div>
              )}
              <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)', 
                marginTop: '0.5rem',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                • At least 8 characters<br />
                • Uppercase & lowercase letters<br />
                • Numbers & special characters
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading || success !== ''}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account?</p>
            <Link to="/login">Login here</Link>
          </div>

          <div className="auth-info">
            <h3>🔒 Account Security</h3>
            <p>• RSA-2048 key pair generated</p>
            <p>• bcrypt password hashing</p>
            <p>• Email OTP for login</p>
            <p>• Comprehensive audit logging</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
