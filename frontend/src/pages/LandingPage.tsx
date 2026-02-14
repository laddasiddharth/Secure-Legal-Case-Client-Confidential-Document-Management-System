import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="container">
          <div className="nav-content">
            <div className="nav-brand">
              <span className="nav-title text-gradient">Legal Docs</span>
            </div>
            <div className="nav-links">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
              <Link to="/security-demo" className="btn btn-secondary btn-sm">
                Security Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title text-gradient">
              Secure Legal Document Management
            </h1>       
            <p className="hero-description">
              A production-grade system designed for law firms and courts to handle 
              extremely sensitive legal data with the highest security standards.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started Free
              </Link>
              <Link to="/security-demo" className="btn btn-outline">
                View Security Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Comprehensive Security Architecture</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔑</div>
              <h3>Multi-Factor Authentication</h3>
              <p>Password + Email OTP for enhanced security</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Role-Based Access Control</h3>
              <p>Lawyer, Client, and Admin roles with ACL matrix</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Hybrid Encryption</h3>
              <p>RSA-2048 + AES-256-GCM for document security</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✍️</div>
              <h3>Digital Signatures</h3>
              <p>RSA-PSS signatures with SHA-256 hashing</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>QR Code Verification</h3>
              <p>Secure case reference and document verification</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Audit Logging</h3>
              <p>Comprehensive security event tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles">
        <div className="container">
          <h2 className="section-title">User Roles</h2>
          <div className="roles-grid">
            <div className="role-card glass">
              <h3>Lawyer</h3>
              <ul>
                <li>Create and manage cases</li>
                <li>Upload evidence documents</li>
                <li>Sign documents digitally</li>
                <li>View assigned cases</li>
              </ul>
            </div>

            <div className="role-card glass">
              <h3>Client</h3>
              <ul>
                <li>View assigned cases</li>
                <li>Read case documents</li>
                <li>Download signed judgments</li>
                <li>Verify document signatures</li>
              </ul>
            </div>

            <div className="role-card glass">
              <h3>Court Admin</h3>
              <ul>
                <li>Full system access</li>
                <li>User management</li>
                <li>View audit logs</li>
                <li>System configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Legal Document Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
