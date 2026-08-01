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
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Route wrapper for role-based dashboard redirection
const DashboardSelector = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
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
          {/* Public Auth Page */}
          <Route path="/auth" element={<Auth />} />
          
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
