import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useApp } from './contexts/AppContext.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

// Layouts
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Landing from './pages/Landing.jsx';
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
import AartiBhajan from './pages/AartiBhajan.jsx';

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

// Permission Guard for individual routes
const PermissionRoute = ({ permission, permissions = [], children }) => {
  const { hasPermission, hasAnyPermission, role } = useApp();

  let isAllowed = false;
  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (permissions.length > 0) {
    isAllowed = hasAnyPermission(permissions);
  } else {
    isAllowed = true;
  }

  if (isAllowed) {
    return children;
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          परवानगी मर्यादित आहे / Access Restricted
        </h2>
        <p className="text-slate-500 text-xs mt-2 leading-relaxed">
          आपल्या खात्याला ({role}) या विभागाचा ॲक्सेस नाही. जर आपल्याला हा विभाग पाहायचा असेल, तर कृपया आपल्या मंडळ प्रशासकाशी (Admin) संपर्क साधा.
        </p>
        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 transition"
          >
            <ArrowLeft size={14} />
            <span>डॅशबोर्डवर परत जा / Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

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
                  <Route path="/dashboard" element={<PermissionRoute permission="dashboard:view"><Dashboard /></PermissionRoute>} />
                  <Route path="/receipts" element={<PermissionRoute permission="receipts:view"><Receipts /></PermissionRoute>} />
                  <Route path="/donors" element={<PermissionRoute permission="donors:view"><Donors /></PermissionRoute>} />
                  <Route path="/donations" element={<PermissionRoute permission="donations:view"><Donations /></PermissionRoute>} />
                  <Route path="/expenses" element={<PermissionRoute permission="expenses:view"><Expenses /></PermissionRoute>} />
                  <Route path="/accounting" element={<PermissionRoute permission="accounting:view"><Accounting /></PermissionRoute>} />
                  <Route path="/vendors" element={<PermissionRoute permission="vendors:view"><Vendors /></PermissionRoute>} />
                  <Route path="/members" element={<PermissionRoute permission="members:view"><Members /></PermissionRoute>} />
                  <Route path="/volunteers" element={<PermissionRoute permission="volunteers:view"><Volunteers /></PermissionRoute>} />
                  <Route path="/events" element={<PermissionRoute permission="events:view"><Events /></PermissionRoute>} />
                  <Route path="/reports" element={<PermissionRoute permission="reports:view"><Reports /></PermissionRoute>} />
                  <Route path="/audit-logs" element={<PermissionRoute permission="audit_logs:view"><AuditLogs /></PermissionRoute>} />
                  <Route path="/aarti" element={<AartiBhajan />} />
                  <Route path="/settings" element={<PermissionRoute permission="settings:view"><Settings /></PermissionRoute>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
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

