import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseAPI, documentAPI, authAPI } from '../services/api';
import Modal from '../components/Modal';
import './ClientDashboard.css';

interface Case {
  _id: string;
  caseNumber: string;
  title: string;
  description: string;
  caseType: string;
  status: string;
  priority: string;
  lawyerId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  documents: string[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface Document {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  description: string;
  uploadedAt: string;
  isSigned: boolean;
  uploadedBy: {
    fullName: string;
  };
}

interface Stats {
  total: number;
  active: number;
  closed: number;
  pending: number;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, closed: 0, pending: 0 });
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseDocuments, setCaseDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'client') {
        navigate('/dashboard');
        return;
      }

      setUser(parsedUser);
      setLoading(false);
      fetchData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.clear();
      navigate('/login');
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [casesRes, statsRes] = await Promise.all([
        caseAPI.getAll(),
        caseAPI.getStats()
      ]);
      
      setCases(casesRes.cases || []);
      setStats(statsRes.stats || { total: 0, active: 0, closed: 0, pending: 0 });
      
      setError('');
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = async (caseItem: Case) => {
    setSelectedCase(caseItem);
    
    try {
      setLoadingDocuments(true);
      const [docsRes, qrRes] = await Promise.all([
        documentAPI.getByCaseId(caseItem._id),
        caseAPI.getQRCode(caseItem._id)
      ]);
      setCaseDocuments(docsRes.documents || []);
      setQrCode(qrRes.qrCode);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      setDownloading(doc._id);
      
      const blob = await documentAPI.download(doc._id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err: any) {
      console.error('Error downloading document:', err);
      alert(err.message || 'Failed to download document');
    } finally {
      setDownloading(null);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/login');
    } catch (err) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="text-gradient">👤 Client Portal</h1>
            <p className="header-subtitle">View Your Legal Cases</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.fullName}</span>
              <span className="user-role">Client</span>
            </div>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-container">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* Welcome Section */}
        <section className="welcome-section">
          <h2 className="text-gradient">Welcome, {user?.fullName}!</h2>
          <p>Track your legal cases and access important documents securely.</p>
        </section>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📁</div>
            <div className="stat-content">
              <h3>Total Cases</h3>
              <p className="stat-number text-gradient">{stats.total}</p>
              <span className="stat-label">All Time</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Active Cases</h3>
              <p className="stat-number text-gradient">{stats.active}</p>
              <span className="stat-label">In Progress</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Closed Cases</h3>
              <p className="stat-number text-gradient">{stats.closed}</p>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>Documents</h3>
              <p className="stat-number text-gradient">
                {cases.reduce((sum, c) => sum + (c.documents?.length || 0), 0)}
              </p>
              <span className="stat-label">Total Files</span>
            </div>
          </div>
        </div>

        {/* My Cases */}
        <section className="cases-section">
          <h2>My Cases ({cases.length})</h2>
          
          {cases.length === 0 ? (
            <div className="empty-state">
              <p>No cases assigned yet. Your lawyer will create cases for you.</p>
            </div>
          ) : (
            <div className="cases-grid">
              {cases.map((caseItem) => (
                <div key={caseItem._id} className="case-card">
                  <div className="case-header">
                    <span className="case-number">{caseItem.caseNumber}</span>
                    <span className={`status-badge status-${caseItem.status}`}>
                      {caseItem.status}
                    </span>
                  </div>
                  
                  <h3>{caseItem.title}</h3>
                  <p className="case-description">{caseItem.description}</p>
                  
                  <div className="case-meta">
                    <div className="meta-item">
                      <span className="meta-label">Type:</span>
                      <span className="meta-value">{caseItem.caseType}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Priority:</span>
                      <span className={`priority-badge priority-${caseItem.priority}`}>
                        {caseItem.priority}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Lawyer:</span>
                      <span className="meta-value">{caseItem.lawyerId?.fullName}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Documents:</span>
                      <span className="meta-value">{caseItem.documents?.length || 0} files</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Last Updated:</span>
                      <span className="meta-value">{formatDate(caseItem.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-block"
                    onClick={() => handleViewCase(caseItem)}
                  >
                    View Details & Documents
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Case Details Modal */}
        <Modal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title={selectedCase ? `${selectedCase.caseNumber} - ${selectedCase.title}` : ''}
          size="large"
        >
          <div className="case-details">
            <div className="detail-section">
              <h3>Case Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge status-${selectedCase?.status}`}>
                    {selectedCase?.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Priority:</span>
                  <span className={`priority-badge priority-${selectedCase?.priority}`}>
                    {selectedCase?.priority}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span>{selectedCase?.caseType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created:</span>
                  <span>{selectedCase ? formatDate(selectedCase.createdAt) : ''}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Description</h3>
              <p>{selectedCase?.description}</p>
            </div>

            {selectedCase?.notes && (
              <div className="detail-section">
                <h3>Notes</h3>
                <p>{selectedCase.notes}</p>
              </div>
            )}

            <div className="detail-section">
              <h3>Assigned Lawyer</h3>
              <div className="lawyer-info">
                <p><strong>{selectedCase?.lawyerId?.fullName}</strong></p>
                <p>Email: {selectedCase?.lawyerId?.email}</p>
                {selectedCase?.lawyerId?.phoneNumber && (
                  <p>Phone: {selectedCase.lawyerId.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Case Verification (QR)</h3>
              <div className="qr-container" style={{ 
                background: 'var(--bg-tertiary)', 
                padding: '20px', 
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid var(--border-color)'
              }}>
                {qrCode ? (
                  <>
                    <img src={qrCode} alt="Case Verification QR" style={{ 
                      width: '200px', 
                      height: '200px',
                      border: '4px solid var(--secondary-color)',
                      borderRadius: '4px'
                    }} />
                    <p style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--secondary-color)' }}>
                      Scan to verify case authenticity in our system
                    </p>
                  </>
                ) : (
                  <p>Loading verification code...</p>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Documents ({caseDocuments.length})</h3>
              
              {loadingDocuments ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                  <p>Loading documents...</p>
                </div>
              ) : caseDocuments.length === 0 ? (
                <p className="empty-message">No documents uploaded yet.</p>
              ) : (
                <div className="documents-table">
                  <table>
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Size</th>
                        <th>Uploaded</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {caseDocuments.map((doc) => (
                        <tr key={doc._id}>
                          <td>{doc.fileName}</td>
                          <td><span className="type-badge">{doc.documentType}</span></td>
                          <td>
                            {doc.isSigned ? (
                              <span className="badge badge-success" style={{fontSize: '0.6rem'}}>Signed</span>
                            ) : (
                              <span className="badge badge-warning" style={{fontSize: '0.6rem'}}>Unsigned</span>
                            )}
                          </td>
                          <td>{formatFileSize(doc.fileSize)}</td>
                          <td>{formatDate(doc.uploadedAt)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleDownloadDocument(doc)}
                              disabled={downloading === doc._id}
                            >
                              {downloading === doc._id ? 'Downloading...' : '📥 Download'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Security Info */}
        <section className="security-section">
          <h2>🔒 Your Data Security</h2>
          <div className="security-grid">
            <div className="security-item">
              <div className="security-icon">🔐</div>
              <h3>End-to-End Encryption</h3>
              <p>All documents are encrypted with AES-256-GCM</p>
            </div>
            <div className="security-item">
              <div className="security-icon">✅</div>
              <h3>Integrity Verification</h3>
              <p>SHA-256 hashing ensures file authenticity</p>
            </div>
            <div className="security-item">
              <div className="security-icon">👁️</div>
              <h3>Read-Only Access</h3>
              <p>View and download your case files securely</p>
            </div>
            <div className="security-item">
              <div className="security-icon">📝</div>
              <h3>Audit Trail</h3>
              <p>All access is logged for security</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClientDashboard;
