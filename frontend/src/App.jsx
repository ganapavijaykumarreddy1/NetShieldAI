import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Incidents from './pages/Incidents';
import ThreatIntel from './pages/ThreatIntel';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import DemoMode from './pages/DemoMode';
import ValidationHealth from './pages/ValidationHealth';
import { Toaster } from 'react-hot-toast';

// Authenticated Layout with Sticky Top Navbar
const AuthenticatedLayout = () => {
  return (
    <div className="min-h-screen bg-cyber-bg">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#111318', color: '#fff', border: '1px solid #1f2937' },
        success: { iconTheme: { primary: '#22c55e', secondary: '#111318' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#111318' } }
      }} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Authenticated Protected Routes with Top Navbar */}
          <Route element={<AuthenticatedLayout />}>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
            <Route path="/threat-intel" element={<ProtectedRoute><ThreatIntel /></ProtectedRoute>} />
            {/* Administrator ONLY Diagnostic & Demonstration Tools */}
            <Route 
              path="/demo" 
              element={
                <ProtectedRoute allowedRoles={['Administrator']}>
                  <DemoMode />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/health-validation" 
              element={
                <ProtectedRoute allowedRoles={['Administrator']}>
                  <ValidationHealth />
                </ProtectedRoute>
              } 
            />
            
            {/* SOC Manager & Administrator restricted pages */}
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute allowedRoles={['Administrator', 'SOC Manager']}>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['Administrator', 'SOC Manager']}>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            
            {/* Administrator ONLY User Management Page */}
            <Route 
              path="/users" 
              element={
                <ProtectedRoute allowedRoles={['Administrator']}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Fallback routing */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
export { App };

