import { Link } from 'react-router-dom';
import './SecurityDemoPage.css';

const SecurityDemoPage = () => {
  return (
    <div className="security-demo-page">
      <nav className="demo-nav">
        <div className="container">
          <Link to="/" className="btn btn-outline">← Back to Home</Link>
        </div>
      </nav>

      <div className="demo-content">
        <div className="container">
          <h1 className="demo-title">🛡️ Security Architecture Demo</h1>
          <p className="demo-subtitle">
            Interactive demonstration of all 5 security components
          </p>

          <div className="demo-grid">
            {/* Part 1: Authentication */}
            <div className="demo-card">
              <div className="demo-header">
                <h2>🔑 Authentication</h2>
              </div>
              <div className="demo-body">
                <h3>Single-Factor Authentication (SFA)</h3>
                <ul>
                  <li>Username + Password</li>
                  <li>bcrypt hashing with unique salt</li>
                  <li>Password strength validation</li>
                </ul>
                
                <h3>Multi-Factor Authentication (MFA)</h3>
                <ul>
                  <li>Email-based OTP (6-digit code)</li>
                  <li>5-minute expiry window</li>
                  <li>Account lockout after 5 failed attempts</li>
                </ul>
                
                <div className="demo-status">
                  <span className="badge badge-success">Active</span>
                  <p>Fully functional MFA and Secure Auth</p>
                </div>
              </div>
            </div>

            {/* Part 2: Authorization */}
            <div className="demo-card">
              <div className="demo-header">
                <h2>👥 Authorization (RBAC)</h2>
              </div>
              <div className="demo-body">
                <h3>Access Control Matrix</h3>
                <table className="acl-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Case File</th>
                      <th>Evidence</th>
                      <th>Judgment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Lawyer</strong></td>
                      <td>Read/Write</td>
                      <td>Read/Upload</td>
                      <td>Read/Sign</td>
                    </tr>
                    <tr>
                      <td><strong>Client</strong></td>
                      <td>Read</td>
                      <td>Read</td>
                      <td>Read</td>
                    </tr>
                    <tr>
                      <td><strong>Admin</strong></td>
                      <td>Full</td>
                      <td>Full</td>
                      <td>Full</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="demo-status">
                  <span className="badge badge-success">Active</span>
                  <p>Enforced across all API endpoints</p>
                </div>
              </div>
            </div>

            {/* Part 3: Encryption */}
            <div className="demo-card">
              <div className="demo-header">
                <h2>🔒 Hybrid Encryption</h2>
              </div>
              <div className="demo-body">
                <h3>Key Management</h3>
                <ul>
                  <li>RSA-2048 for key generation</li>
                  <li>Public/Private key pairs per user</li>
                </ul>
                
                <h3>Document Encryption</h3>
                <ul>
                  <li>AES-256-GCM for document encryption</li>
                  <li>Authenticated decryption with AuthTags</li>
                  <li>Encryption at rest in MongoDB</li>
                </ul>
                
                <div className="demo-status">
                  <span className="badge badge-success">Active</span>
                  <p>FIPS-compliant encryption standard</p>
                </div>
              </div>
            </div>

            {/* Part 4: Hashing & Signatures */}
            <div className="demo-card">
              <div className="demo-header">
                <h2>✍️ Hashing & Integrity</h2>
              </div>
              <div className="demo-body">
                <h3>Data Integrity</h3>
                <ul>
                  <li>SHA-256 hash of every document</li>
                  <li>bcrypt with salt for passwords</li>
                </ul>
                
                <h3>Digital Signatures</h3>
                <ul>
                  <li>RSA-based verifiable signatures</li>
                  <li>Tamper-proof document verification</li>
                  <li>Non-repudiation logging</li>
                </ul>
                
                <div className="demo-status">
                  <span className="badge badge-success">Active</span>
                  <p>SHA-256 verified on every download</p>
                </div>
              </div>
            </div>

            {/* Part 5: Encoding */}
            <div className="demo-card">
              <div className="demo-header">
                <h2>📱 Encoding Techniques</h2>
              </div>
              <div className="demo-body">
                <h3>Safety Protocols</h3>
                <ul>
                  <li>Base64 encoding for safe transport</li>
                  <li>Binary safe storage in MongoDB</li>
                  <li>Sanitized I/O streams</li>
                </ul>
                
                <div className="demo-status">
                  <span className="badge badge-success">Active</span>
                  <p>Safe transport of binary data</p>
                </div>
              </div>
            </div>

            {/* Theory: Attack Scenarios */}
            <div className="demo-card">
              <div className="demo-header">
                <h2>🛡️ Attack Countermeasures</h2>
              </div>
              <div className="demo-body">
                <h3>Mitigation Strategies</h3>
                <ul>
                  <li><strong>Replay Attack:</strong> JWT expiry & OTP time limits</li>
                  <li><strong>Unauthorized Access:</strong> RBAC enforcement</li>
                  <li><strong>Document Tampering:</strong> SHA-256 hashing</li>
                  <li><strong>Man-in-the-Middle:</strong> TLS/SSL enabled transport</li>
                  <li><strong>Insider Threats:</strong> Immutable Audit logging</li>
                </ul>
                
                <div className="demo-status">
                  <span className="badge badge-success">Active</span>
                  <p>All countermeasures fully integrated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDemoPage;
