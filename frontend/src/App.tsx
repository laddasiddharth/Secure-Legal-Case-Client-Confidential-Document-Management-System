import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSkeleton from './components/LoadingSkeleton';
import './styles/mobile.css';

// Eager-loaded pages (small, frequently accessed)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Lazy-loaded pages (larger, less frequently accessed)
const SecurityDemoPage = lazy(() => import('./pages/SecurityDemoPage'));
const LawyerDashboard = lazy(() => import('./pages/LawyerDashboard'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ padding: '40px' }}>
    <LoadingSkeleton type="stats" count={4} />
    <div style={{ marginTop: '20px' }}>
      <LoadingSkeleton type="card" count={3} />
    </div>
  </div>
);

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

  try {
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
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
