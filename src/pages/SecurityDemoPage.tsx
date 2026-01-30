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
                  <span className="badge badge-warning">Phase 2</span>
                  <p>Will be implemented in Phase 2</p>
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
                  <span className="badge badge-warning">Phase 3</span>
                  <p>Will be implemented in Phase 3</p>
                </div>
              </div>
            </div>

            {/* Part 3: Encryption */}
            <div className="demo-card">
              <div className="demo-header">
                <h2>🔒 Hybrid Encryption</h2>
              </div>
              <div className="demo-body">
                <h3>Key Exchange</h3>
                <ul>
                  <li>RSA-2048 for key exchange</li>
                  <li>Public/Private key pairs per user</li>
                </ul>
                
                <h3>Document Encryption</h3>
                <ul>
                  <li>AES-256-GCM for document encryption</li>
                  <li>Random session key per document</li>
                  <li>Encryption at rest in MongoDB</li>
                </ul>
                
                <div className="demo-status">
                  <span className="badge badge-warning">Phase 4</span>
                  <p>Will be implemented in Phase 4</p>
                </div>
              </div>
            </div>

            {/* Part 4: Hashing & Signatures */}
            <div className="demo-card">
              <div className="demo-header">
                <h2>✍️ Hashing & Digital Signatures</h2>
              </div>
              <div className="demo-body">
                <h3>Password Hashing</h3>
                <ul>
                  <li>bcrypt with unique salt per user</li>
                  <li>Secure password storage</li>
                </ul>
                
                <h3>Digital Signatures</h3>
                <ul>
                  <li>SHA-256 hash of document</li>
                  <li>RSA-PSS signature by lawyer</li>
                  <li>Signature verification for integrity</li>
                  <li>Non-repudiation guarantee</li>
                </ul>
                
                <div className="demo-status">
                  <span className="badge badge-warning">Phase 5</span>
                  <p>Will be implemented in Phase 5</p>
                </div>
              </div>
            </div>

            {/* Part 5: Encoding */}
            <div className="demo-card">
              <div className="demo-header">
                <h2>📱 Encoding Techniques</h2>
              </div>
              <div className="demo-body">
                <h3>QR Code Generation</h3>
                <ul>
                  <li>Case reference ID</li>
                  <li>Secure document verification link</li>
                  <li>Quick access to case details</li>
                </ul>
                
                <h3>Base64 Encoding</h3>
                <ul>
                  <li>Encrypted document transfer</li>
                  <li>Binary data encoding</li>
                </ul>
                
                <div className="demo-status">
                  <span className="badge badge-warning">Phase 6</span>
                  <p>Will be implemented in Phase 6</p>
                </div>
              </div>
            </div>

            {/* Theory: Attack Scenarios */}
            <div className="demo-card">
              <div className="demo-header">
                <h2>🛡️ Attack Scenarios & Countermeasures</h2>
              </div>
              <div className="demo-body">
                <h3>Possible Attacks</h3>
                <ul>
                  <li><strong>Replay Attack:</strong> JWT expiry & OTP time limits</li>
                  <li><strong>Unauthorized Access:</strong> RBAC enforcement</li>
                  <li><strong>Document Tampering:</strong> Digital signatures</li>
                  <li><strong>Man-in-the-Middle:</strong> HTTPS + encryption</li>
                  <li><strong>Insider Threats:</strong> Audit logging</li>
                </ul>
                
                <div className="demo-status">
                  <span className="badge badge-warning">Phase 7</span>
                  <p>Will be implemented in Phase 7</p>
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
