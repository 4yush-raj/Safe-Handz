import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InsuranceDashboard from './components/InsuranceDashboard';
import './App.css';

// Route wrapper for authenticated users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!user) {
    const lastPortal = localStorage.getItem('lastPortal');
    const validPortals = ['client', 'agent', 'admin'];
    const targetPortal = lastPortal && validPortals.includes(lastPortal) ? lastPortal : 'client';
    return <Navigate to={`/login/${targetPortal}`} replace />;
  }
  
  return children;
};

// Route wrapper for role-based dashboard redirection
const DashboardSelector = () => {
  const { user } = useAuth();

  if (!user) {
    const lastPortal = localStorage.getItem('lastPortal');
    const validPortals = ['client', 'agent', 'admin'];
    const targetPortal = lastPortal && validPortals.includes(lastPortal) ? lastPortal : 'client';
    return <Navigate to={`/login/${targetPortal}`} replace />;
  }

  if (user.role === 'ADMIN' || user.role === 'AGENT') {
    return <AdminDashboard />;
  }

  return <CustomerDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Pages */}
          <Route path="/auth" element={<Navigate to="/login/client" replace />} />
          <Route path="/login" element={<Navigate to="/login/client" replace />} />
          <Route path="/login/customer" element={<Navigate to="/login/client" replace />} />
          <Route path="/login/:portalRole" element={<Auth />} />
          
          {/* Protected Main App Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardSelector />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/insurance-dashboard"
            element={<InsuranceDashboard userRole="ADMIN" />}
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
