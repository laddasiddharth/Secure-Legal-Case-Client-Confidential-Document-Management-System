import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SecurityDemoPage from './pages/SecurityDemoPage';

// Role-specific Dashboards
import LawyerDashboard from './pages/LawyerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

// Dashboard Router - Redirects to role-specific dashboard
const DashboardRouter = () => {
  const userData = localStorage.getItem('user');
  
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userData);
  
  switch (user.role) {
    case 'lawyer':
      return <Navigate to="/lawyer/dashboard" replace />;
    case 'client':
      return <Navigate to="/client/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/security-demo" element={<SecurityDemoPage />} />

          {/* Dashboard Router - Redirects to role-specific dashboard */}
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Role-Specific Protected Routes */}
          <Route 
            path="/lawyer/dashboard" 
            element={
              <ProtectedRoute>
                <LawyerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/client/dashboard" 
            element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
