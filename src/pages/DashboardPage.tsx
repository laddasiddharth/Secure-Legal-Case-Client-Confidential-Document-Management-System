import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

interface DashboardPageProps {
  role: string | null;
}

const DashboardPage = ({ role }: DashboardPageProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="container">
          <div className="nav-content">
            <h2>🔐 Legal Document System</h2>
            <div className="nav-actions">
              <span className="user-role">
                Role: <strong>{role || 'Unknown'}</strong>
              </span>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="container">
          <h1>Welcome to Dashboard</h1>
          <p>Dashboard functionality will be implemented in Phase 3 (Authorization & RBAC)</p>

          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📊 Implementation Progress</h3>
              </div>
              <div className="card-body">
                <ul className="progress-list">
                  <li className="completed">✅ Phase 1: Project Setup & Foundation</li>
                  <li className="in-progress">🔄 Phase 2: Authentication System (Next)</li>
                  <li>⏳ Phase 3: Authorization & Access Control</li>
                  <li>⏳ Phase 4: Encryption System</li>
                  <li>⏳ Phase 5: Hashing & Digital Signatures</li>
                  <li>⏳ Phase 6: Encoding & Additional Features</li>
                  <li>⏳ Phase 7: Security Demo & Theory</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🎯 Your Role: {role}</h3>
              </div>
              <div className="card-body">
                {role === 'lawyer' && (
                  <ul>
                    <li>Create and manage cases</li>
                    <li>Upload evidence documents</li>
                    <li>Sign documents digitally</li>
                    <li>View assigned cases</li>
                  </ul>
                )}
                {role === 'client' && (
                  <ul>
                    <li>View assigned cases</li>
                    <li>Read case documents</li>
                    <li>Download signed judgments</li>
                    <li>Verify document signatures</li>
                  </ul>
                )}
                {role === 'admin' && (
                  <ul>
                    <li>Full system access</li>
                    <li>User management</li>
                    <li>View audit logs</li>
                    <li>System configuration</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
