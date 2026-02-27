import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Rewards from './pages/Rewards';
import Redemptions from './pages/Redemptions';
import AdminDashboard from './pages/AdminDashboard';
import AdminRewards from './pages/AdminRewards';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/" element={<LandingPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Transactions />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/rewards" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Rewards />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/redemptions" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Redemptions />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/rewards" element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout>
                <AdminRewards />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/reports" element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout>
                <AdminReports />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/settings" element={
            <ProtectedRoute requireAdmin>
              <DashboardLayout>
                <AdminSettings />
              </DashboardLayout>
            </ProtectedRoute>
          } />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
