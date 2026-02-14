import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseAPI, documentAPI, authAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import './LawyerDashboard.css';

interface Case {
  _id: string;
  caseNumber: string;
  title: string;
  description: string;
  caseType: string;
  status: string;
  priority: string;
  clientId: {
    _id: string;
    fullName: string;
    email: string;
  };
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

interface Document {
  _id: string;
  fileName: string;
  documentType: string;
  uploadedAt: string;
  isSigned: boolean;
}

interface Stats {
  total: number;
  active: number;
  closed: number;
  pending: number;
}

interface Client {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber?: string;
}

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, closed: 0, pending: 0 });
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditCaseModal, setShowEditCaseModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showAllCasesModal, setShowAllCasesModal] = useState(false);
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCaseForAction, setSelectedCaseForAction] = useState<Case | null>(null);
  const [caseDocuments, setCaseDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  // Form states
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    caseType: 'civil',
    clientId: '',
    priority: 'medium'
  });

  const [editCaseForm, setEditCaseForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    notes: ''
  });
  
  const [uploadForm, setUploadForm] = useState({
    files: [] as File[],
    documentType: 'other',
    description: ''
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [casePage, setCasePage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const itemsPerPage = 5;

  // Confirm dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {}
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      // Check if user is a lawyer
      if (parsedUser.role !== 'lawyer') {
        navigate('/dashboard');
        return;
      }

      setUser(parsedUser);
      setLoading(false);
      
      // Fetch data after user is set
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
      
      // Fetch cases, stats, and clients in parallel
      const [casesRes, statsRes, clientsRes] = await Promise.all([
        caseAPI.getAll(),
        caseAPI.getStats(),
        caseAPI.getClients()
      ]);
      
      setCases(casesRes.cases || []);
      setStats(statsRes.stats || { total: 0, active: 0, closed: 0, pending: 0 });
      setClients(clientsRes.clients || []);
      
      setError('');
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCase.clientId) {
      setError('Please select a client');
      return;
    }
    
    try {
      setSubmitting(true);
      await caseAPI.create(newCase);
      
      // Reset form and close modal
      setNewCase({
        title: '',
        description: '',
        caseType: 'civil',
        clientId: '',
        priority: 'medium'
      });
      setShowNewCaseModal(false);
      
      // Refresh data
      await fetchData();
      
      alert('Case created successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to create case');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCase = (caseItem: Case) => {
    setSelectedCaseForAction(caseItem);
    setEditCaseForm({
      title: caseItem.title,
      description: caseItem.description,
      status: caseItem.status,
      priority: caseItem.priority,
      notes: ''
    });
    setShowEditCaseModal(true);
  };

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForAction) return;
    try {
      setSubmitting(true);
      await caseAPI.update(selectedCaseForAction._id, editCaseForm);
      setShowEditCaseModal(false);
      fetchData();
      alert('Case updated successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to update case');
    } finally {
      setSubmitting(false);
    }
  };


  const handleViewDocuments = async (caseId: string) => {
    const caseItem = cases.find(c => c._id === caseId);
    if (!caseItem) return;
    
    setSelectedCaseForAction(caseItem);
    setShowDocumentsModal(true);
    setLoadingDocs(true);
    try {
      const [docsRes, qrRes] = await Promise.all([
        documentAPI.getByCaseId(caseId),
        caseAPI.getQRCode(caseId)
      ]);
      setCaseDocuments(docsRes.documents || []);
      setQrCode(qrRes.qrCode);
    } catch (err: any) {
      console.error('Error fetching docs/qr:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleViewQR = async (caseItem: Case) => {
    try {
      setSelectedCaseForAction(caseItem);
      setShowQRModal(true);
      setQrCode(null);
      const res = await caseAPI.getQRCode(caseItem._id);
      setQrCode(res.qrCode);
    } catch (err) {
      console.error('QR error:', err);
    }
  };

  const handleDownloadDocument = async (docId: string, fileName: string) => {
    try {
      const blob = await documentAPI.download(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Failed to download document');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await documentAPI.delete(docId);
          if (selectedCaseForAction) {
            const res = await documentAPI.getByCaseId(selectedCaseForAction._id);
            setCaseDocuments(res.documents || []);
          }
          fetchData();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          alert(err.message || 'Failed to delete document');
        }
      }
    });
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadForm.files.length === 0 || !selectedCaseForAction) {
      alert('Please select at least one file and a case');
      return;
    }

    const count = uploadForm.files.length;
    try {
      setSubmitting(true);
      setError('');
      
      // Upload each file in parallel
      // Upload files in batches to limit concurrency
      const CONCURRENCY_LIMIT = 3;
      const files = uploadForm.files;
      
      for (let i = 0; i < files.length; i += CONCURRENCY_LIMIT) {
        const batch = files.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.all(batch.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('caseId', selectedCaseForAction!._id);
          formData.append('documentType', uploadForm.documentType);
          formData.append('description', uploadForm.description);

          return documentAPI.upload(formData);
        }));
      }

      setShowUploadModal(false);
      setUploadForm({ files: [], documentType: 'other', description: '' });
      await fetchData();
      alert(`${count} document(s) uploaded and encrypted successfully!`);
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.message || 'Failed to upload documents';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignDocument = async (docId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Digital Signature',
      message: 'By signing this document, you are applying a cryptographic RSA-PSS signature. This action is legally binding in this system. Continue?',
      type: 'warning',
      onConfirm: async () => {
        try {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          setLoadingDocs(true);
          await documentAPI.sign(docId);
          if (selectedCaseForAction) {
            const docsRes = await documentAPI.getByCaseId(selectedCaseForAction._id);
            setCaseDocuments(docsRes.documents || []);
          }
          alert('Document signed successfully with RSA-PSS!');
        } catch (err: any) {
          alert(err.message || 'Failed to sign document');
        } finally {
          setLoadingDocs(false);
        }
      }
    });
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/login');
    } catch (err) {
      // Even if API fails, clear local storage and redirect
      localStorage.clear();
      navigate('/login');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
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
    <div className="lawyer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Lawyer Portal</h1>
            <p className="header-subtitle">Legal Case Management System</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.fullName}</span>
              <span className="user-role">Lawyer</span>
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
            <button onClick={() => setError('')} style={{ marginLeft: 'auto' }}>✕</button>
          </div>
        )}

        {/* Welcome Section */}
        <section className="welcome-section">
          <h2 className="text-gradient">Welcome back, {user?.fullName}!</h2>
          <p>Manage your cases, documents, and clients from your secure portal.</p>
        </section>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📂</div>
            <div className="stat-content">
              <h3>Active Cases</h3>
              <p className="stat-number text-gradient">{stats.active}</p>
              <span className="stat-label">In Progress</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>Total Cases</h3>
              <p className="stat-number text-gradient">{stats.total}</p>
              <span className="stat-label">All Time</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>My Clients</h3>
              <p className="stat-number text-gradient">{new Set(cases.map(c => c.clientId?._id).filter(id => !!id)).size}</p>
              <span className="stat-label">Active Connections</span>
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
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-card" onClick={() => setShowNewCaseModal(true)}>
              <div className="action-icon">📂</div>
              <h3>New Case</h3>
              <p>Create a new legal case</p>
            </button>

            <button className="action-card" onClick={() => { 
                setSelectedCaseForAction(null);
                setUploadForm({ files: [], documentType: 'other', description: '' });
                setShowUploadModal(true); 
              }}>
              <div className="action-icon">📤</div>
              <h3>Upload Document</h3>
              <p>Add encrypted documents</p>
            </button>

            <button className="action-card" onClick={() => setShowAllCasesModal(true)}>
              <div className="action-icon">📋</div>
              <h3>View All Cases</h3>
              <p>Browse all your cases</p>
            </button>

            <button className="action-card" onClick={() => setShowClientsModal(true)}>
              <div className="action-icon">👤</div>
              <h3>Manage Clients</h3>
              <p>View client list</p>
            </button>
          </div>
        </section>

        {/* Recent Cases */}
        <section className="recent-section">
          <h2>Recent Cases ({cases.length})</h2>
          
          {cases.length === 0 ? (
            <div className="empty-state">
              <p>No cases yet. Create your first case to get started!</p>
              <button className="btn btn-primary" onClick={() => setShowNewCaseModal(true)}>
                Create Case
              </button>
            </div>
          ) : (
            <div className="cases-table">
              <table>
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Title</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Last Updated</th>
                    <th>Docs</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.slice(0, 10).map((caseItem) => (
                    <tr key={caseItem._id}>
                      <td><span className="case-id">{caseItem.caseNumber}</span></td>
                      <td>{caseItem.title}</td>
                      <td>{caseItem.clientId?.fullName || 'N/A'}</td>
                      <td><span className="type-badge">{caseItem.caseType}</span></td>
                      <td>
                        <span className={`status-badge status-${caseItem.status}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge priority-${caseItem.priority}`}>
                          {caseItem.priority}
                        </span>
                      </td>
                      <td>{formatDate(caseItem.updatedAt)}</td>
                      <td>{caseItem.documents?.length || 0}</td>
                      <td>
                        <button className="btn-table-action" title="View Documents" onClick={() => handleViewDocuments(caseItem._id)}>📄</button>
                        <button className="btn-table-action" title="Verify Case" onClick={() => handleViewQR(caseItem)}>🔍</button>
                        <button className="btn-table-action" title="Edit Case" onClick={() => handleEditCase(caseItem)}>✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* New Case Modal */}
      <Modal
        isOpen={showNewCaseModal}
        onClose={() => setShowNewCaseModal(false)}
        title="Create New Case"
        size="medium"
      >
        <form onSubmit={handleCreateCase}>
          <div className="form-group">
            <label>Case Title *</label>
            <input
              type="text"
              className="form-input"
              value={newCase.title}
              onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
              required
              placeholder="e.g., Property Dispute"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              className="form-input"
              value={newCase.description}
              onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
              required
              rows={4}
              placeholder="Detailed case description..."
            />
          </div>

          <div className="form-group">
            <label>Case Type *</label>
            <select
              className="form-select"
              value={newCase.caseType}
              onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value })}
              required
            >
              <option value="civil">Civil</option>
              <option value="criminal">Criminal</option>
              <option value="corporate">Corporate</option>
              <option value="family">Family</option>
              <option value="property">Property</option>
              <option value="intellectual-property">Intellectual Property</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Client *</label>
            <select
              className="form-select"
              value={newCase.clientId}
              onChange={(e) => setNewCase({ ...newCase, clientId: e.target.value })}
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.fullName} ({client.email})
                </option>
              ))}
            </select>
            {clients.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: '#fbbf24', marginTop: '0.5rem' }}>
                No clients available. Register clients first.
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              className="form-select"
              value={newCase.priority}
              onChange={(e) => setNewCase({ ...newCase, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowNewCaseModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        size="medium"
      >
        <form onSubmit={handleUploadDocument}>
          <div className="form-group">
            <label>Select Case *</label>
            <select
              className="form-select"
              value={selectedCaseForAction?._id || ''}
              onChange={(e) => {
                const c = cases.find(curr => curr._id === e.target.value);
                setSelectedCaseForAction(c || null);
              }}
              required
            >
              <option value="">Choose a case</option>
              {cases.map((caseItem) => (
                <option key={caseItem._id} value={caseItem._id}>
                  {caseItem.caseNumber} - {caseItem.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Document File *</label>
            <input
              type="file"
              className="form-input"
              onChange={(e) => {
                const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
                setUploadForm({ ...uploadForm, files: selectedFiles });
              }}
              required
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            {uploadForm.files.length > 0 && (
              <div className="selected-files-preview" style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>Selected Files ({uploadForm.files.length}):</p>
                <ul style={{ listStyle: 'none', padding: '5px', margin: 0, maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                  {uploadForm.files.map((f, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', padding: '2px 0', borderBottom: i < uploadForm.files.length - 1 ? '1px solid #333' : 'none' }}>
                      📄 {f.name} ({(f.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p style={{ fontSize: '0.85rem', color: '#b8b8b8', marginTop: '0.5rem' }}>
              Supported: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB per file)
            </p>
          </div>

          <div className="form-group">
            <label>Document Type</label>
            <select
              className="form-select"
              value={uploadForm.documentType}
              onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
            >
              <option value="evidence">Evidence</option>
              <option value="contract">Contract</option>
              <option value="agreement">Agreement</option>
              <option value="certificate">Certificate</option>
              <option value="report">Report</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              className="form-input"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the document..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowUploadModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Uploading...' : 'Upload & Encrypt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Case Modal */}
      <Modal 
        isOpen={showEditCaseModal} 
        onClose={() => setShowEditCaseModal(false)}
        title="Edit Case Details"
        size="medium"
      >
        <form onSubmit={handleUpdateCase}>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              className="form-input"
              value={editCaseForm.title}
              onChange={(e) => setEditCaseForm({...editCaseForm, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-input"
              value={editCaseForm.description}
              onChange={(e) => setEditCaseForm({...editCaseForm, description: e.target.value})}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select 
              className="form-select"
              value={editCaseForm.status}
              onChange={(e) => setEditCaseForm({...editCaseForm, status: e.target.value})}
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select 
              className="form-select"
              value={editCaseForm.priority}
              onChange={(e) => setEditCaseForm({...editCaseForm, priority: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea 
              className="form-input"
              value={editCaseForm.notes}
              onChange={(e) => setEditCaseForm({...editCaseForm, notes: e.target.value})}
              placeholder="Internal notes..."
            ></textarea>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowEditCaseModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Case Documents Modal */}
      <Modal
        isOpen={showDocumentsModal}
        onClose={() => setShowDocumentsModal(false)}
        title={selectedCaseForAction ? `Documents for ${selectedCaseForAction.caseNumber}` : 'Case Documents'}
        size="large"
      >
        <div className="documents-view">
          {loadingDocs ? (
            <div className="loading-spinner" style={{ margin: '40px auto' }}></div>
          ) : caseDocuments.length === 0 ? (
            <div className="empty-message-container">No documents attached to this case.</div>
          ) : (
            <div className="documents-table">
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {caseDocuments.map(doc => (
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
                      <td>{formatDate(doc.uploadedAt)}</td>
                      <td>
                        <button className="btn-table-action" title="Download" onClick={() => handleDownloadDocument(doc._id, doc.fileName)}>📥</button>
                        {!doc.isSigned && (
                          <button className="btn-table-action" title="Sign Document" onClick={() => handleSignDocument(doc._id)}>✍️</button>
                        )}
                        <button className="btn-table-action danger" title="Delete" onClick={() => handleDeleteDocument(doc._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* View All Cases Modal */}
      <Modal
        isOpen={showAllCasesModal}
        onClose={() => setShowAllCasesModal(false)}
        title="All Assigned Cases"
        size="large"
      >
        <div className="cases-table">
          {cases.length === 0 ? (
            <p className="empty-message" style={{textAlign: 'center', padding: '40px'}}>No cases found.</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.slice((casePage - 1) * itemsPerPage, casePage * itemsPerPage).map((c) => (
                    <tr key={c._id}>
                      <td>{c.caseNumber}</td>
                      <td>{c.title}</td>
                      <td>{c.clientId?.fullName}</td>
                      <td><span className={`status-badge status-${c.status}`}>{c.status}</span></td>
                      <td>
                        <button className="btn-table-action" title="Documents" onClick={() => { handleViewDocuments(c._id); setShowAllCasesModal(false); }}>📄</button>
                        <button className="btn-table-action" title="QR Code" onClick={() => { handleViewQR(c); setShowAllCasesModal(false); }}>🔍</button>
                        <button className="btn-table-action" title="Edit" onClick={() => { handleEditCase(c); setShowAllCasesModal(false); }}>✏️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={casePage === 1}
                  onClick={() => setCasePage(casePage - 1)}
                >
                  Previous
                </button>
                <span style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>
                  Page {casePage} of {Math.ceil(cases.length / itemsPerPage)}
                </span>
                <button 
                  className="btn btn-outline btn-sm" 
                  disabled={casePage >= Math.ceil(cases.length / itemsPerPage)}
                  onClick={() => setCasePage(casePage + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Manage Clients Modal */}
      <Modal
        isOpen={showClientsModal}
        onClose={() => setShowClientsModal(false)}
        title="Client Management"
        size="large"
      >
        <div className="clients-view">
          <div className="clients-section">
            <h3 className="modal-section-title text-gradient">
              My Associated Clients
            </h3>
            {clients.filter(client => cases.some(c => c.clientId?._id === client._id)).length === 0 ? (
              <div className="empty-message-container">
                You haven't added any clients to your cases yet.
              </div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Active Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.filter(client => cases.some(c => c.clientId?._id === client._id)).map(client => (
                      <tr key={client._id}>
                        <td>{client.fullName}</td>
                        <td>{client.email}</td>
                        <td>
                          {cases.filter(c => c.clientId?._id === client._id).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="clients-section" style={{ marginTop: '40px' }}>
            <h3 className="modal-section-title text-gradient">
              🔍 Global Client Registry (Available to Link)
            </h3>
            <p className="modal-section-description">
              These are all clients registered in the management system. You can create a new case for them to add them to your practice.
            </p>
            {clients.length === 0 ? (
              <div className="empty-message-container">No clients in registry.</div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.slice((clientPage - 1) * itemsPerPage, clientPage * itemsPerPage).map(client => (
                      <tr key={client._id}>
                        <td>{client.fullName}</td>
                        <td>{client.email}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary" 
                            style={{ padding: '0.6rem 1.2rem', fontWeight: '600' }}
                            onClick={() => {
                              setNewCase({ ...newCase, clientId: client._id });
                              setShowClientsModal(false);
                              setShowNewCaseModal(true);
                            }}
                          >
                            + Create Case
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                  <button 
                    className="btn btn-outline btn-sm" 
                    disabled={clientPage === 1}
                    onClick={() => setClientPage(clientPage - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>
                    Page {clientPage} of {Math.ceil(clients.length / itemsPerPage)}
                  </span>
                  <button 
                    className="btn btn-outline btn-sm" 
                    disabled={clientPage >= Math.ceil(clients.length / itemsPerPage)}
                    onClick={() => setClientPage(clientPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={selectedCaseForAction ? `Verification: ${selectedCaseForAction.caseNumber}` : 'Case Verification'}
        size="small"
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {qrCode ? (
            <>
              <div style={{ 
                background: '#fff', 
                padding: '15px', 
                display: 'inline-block',
                borderRadius: '8px',
                border: '4px solid var(--secondary-color)'
              }}>
                <img src={qrCode} alt="Case QR Code" style={{ width: '250px', height: '250px' }} />
              </div>
              <h3 style={{ marginTop: '20px', color: 'var(--secondary-color)' }}>{selectedCaseForAction?.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Scan this code to verify the authenticity of this legal case.
              </p>
            </>
          ) : (
            <div className="loading-spinner" style={{ margin: '40px auto' }}></div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default LawyerDashboard;
