import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import PasswordInput from '../components/PasswordInput';
import { PASSWORD_MIN_LENGTH } from '../constants';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { success, error: showError, ToastContainer } = useToast();
  
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
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength.score < 4) {
      showError('Password is not strong enough. Please use a stronger password.');
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

      success('Registration successful! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      showError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <ToastContainer />
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="text-gradient">Register</h1>
            <p>Create your secure account</p>
          </div>

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
                autoComplete="name"
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
                autoComplete="username"
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
                autoComplete="email"
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
                autoComplete="tel"
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
                Admin accounts can only be created by existing administrators
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                showStrength={true}
                onStrengthChange={setPasswordStrength}
                autoComplete="new-password"
              />
              <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)', 
                marginTop: '0.5rem',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                • At least {PASSWORD_MIN_LENGTH} characters<br />
                • Uppercase & lowercase letters<br />
                • Numbers & special characters
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account?</p>
            <Link to="/login">Login here</Link>
          </div>

          <div className="auth-info">
            <h3>Account Security</h3>
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
