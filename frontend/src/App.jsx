import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './contexts/AppContext.jsx';

// Layouts
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Receipts from './pages/Receipts.jsx';
import Donors from './pages/Donors.jsx';
import Donations from './pages/Donations.jsx';
import Expenses from './pages/Expenses.jsx';
import Accounting from './pages/Accounting.jsx';
import Vendors from './pages/Vendors.jsx';
import Members from './pages/Members.jsx';
import Volunteers from './pages/Volunteers.jsx';
import Events from './pages/Events.jsx';
import Reports from './pages/Reports.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import Settings from './pages/Settings.jsx';

// Private Route Guard Component
const PrivateRoute = ({ children }) => {
  const { token, user, loading } = useApp();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
          <p className="text-slate-500 font-medium text-sm">लोड होत आहे / Loading...</p>
        </div>
      </div>
    );
  }

  return (token && user) ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Dashboard ERP Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/receipts" element={<Receipts />} />
                  <Route path="/donors" element={<Donors />} />
                  <Route path="/donations" element={<Donations />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/accounting" element={<Accounting />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/volunteers" element={<Volunteers />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/audit-logs" element={<AuditLogs />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
