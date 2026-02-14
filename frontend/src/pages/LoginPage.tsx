import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import PasswordInput from '../components/PasswordInput';
import { OTP_LENGTH, OTP_EXPIRY_MINUTES } from '../constants';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { success, error: showError, ToastContainer } = useToast();
  
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authAPI.login(formData.email, formData.password);
      
      setUserId(data.userId);
      success('OTP sent to your email!');
      setStep('otp');

    } catch (err: any) {
      showError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authAPI.verifyOTP(userId, otp);

      // Store user data (Token is now in HttpOnly cookie)
      localStorage.setItem('user', JSON.stringify(data.user));

      success('Login successful! Redirecting...');
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (err: any) {
      showError(err.message || 'Failed to verify OTP');
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
            <h1 className="text-gradient">Login</h1>
            <p>Access your secure legal documents</p>
          </div>

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
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
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
                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Enter Verification Code</label>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1rem' }}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      className="form-input"
                      style={{ 
                        width: '45px', 
                        height: '55px', 
                        textAlign: 'center', 
                        fontSize: '1.5rem',
                        padding: '0',
                        fontFamily: 'JetBrains Mono, monospace',
                        backgroundColor: 'rgba(212, 165, 116, 0.05)',
                        border: '1px solid rgba(212, 165, 116, 0.2)'
                      }}
                      value={otp[index] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!/^\d*$/.test(val)) return;
                        
                        const newOtp = otp.split('');
                        newOtp[index] = val.slice(-1);
                        const joined = newOtp.join('');
                        setOtp(joined);
                        
                        if (val && index < 5) {
                          const nextInput = e.target.nextElementSibling as HTMLInputElement;
                          if (nextInput) nextInput.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                          const prevInput = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                          if (prevInput) prevInput.focus();
                        }
                      }}
                    />
                  ))}
                </div>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-secondary)', 
                  marginTop: '1.5rem',
                  textAlign: 'center',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  Check your email for the {OTP_LENGTH}-digit OTP (expires in {OTP_EXPIRY_MINUTES} minutes)
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
            <h3>Security Features</h3>
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
