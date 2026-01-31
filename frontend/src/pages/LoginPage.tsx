import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUserId(data.userId);
      setSuccess('OTP sent to your email!');
      setStep('otp');

    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess('Login successful! Redirecting...');
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🔐 Login</h1>
            <p>Access your secure legal documents</p>
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

          {step === 'credentials' ? (
            <form className="auth-form" onSubmit={handleLogin}>
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
                  placeholder="lawyer@example.com"
                />
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
                  placeholder="Enter your password"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label className="form-label" htmlFor="otp">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  className="form-input"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError('');
                  }}
                  required
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  style={{ 
                    fontSize: '1.5rem', 
                    textAlign: 'center', 
                    letterSpacing: '0.5rem',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                />
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)', 
                  marginTop: '0.5rem',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  Check your email for the 6-digit OTP (expires in 5 minutes)
                </p>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button 
                type="button" 
                className="btn btn-outline btn-block"
                onClick={() => {
                  setStep('credentials');
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
                style={{ marginTop: '1rem' }}
              >
                ← Back to Login
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>Don't have an account?</p>
            <Link to="/register">Register here</Link>
          </div>

          <div className="auth-info">
            <h3>🔒 Security Features</h3>
            <p>• Multi-Factor Authentication (MFA)</p>
            <p>• Email OTP verification</p>
            <p>• Account lockout after 5 failed attempts</p>
            <p>• 24-hour session expiry</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
