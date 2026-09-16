import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import AppLayout from '../components/layout/AppLayout';

import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import Leads from '../pages/leads/Leads';
import LeadDetails from '../pages/leads/LeadDetails';
import Properties from '../pages/properties/Properties';
import ProjectDetails from '../pages/properties/ProjectDetails';
import Bookings from '../pages/bookings/Bookings';
import Employees from '../pages/employees/Employees';

/** Redirect authenticated users away from public pages */
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

/** Redirect unauthenticated users to login */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <AppLayout>{children}</AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
}

/** Restrict to admin only */
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Protected */}
      <Route path="/dashboard"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/leads"                element={<ProtectedRoute><Leads /></ProtectedRoute>} />
      <Route path="/leads/:id"            element={<ProtectedRoute><LeadDetails /></ProtectedRoute>} />
      <Route path="/properties"           element={<ProtectedRoute><Properties /></ProtectedRoute>} />
      <Route path="/properties/:projectId" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
      <Route path="/properties/:id"        element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
      <Route path="/bookings"             element={<ProtectedRoute><Bookings /></ProtectedRoute>} />

      {/* Admin only */}
      <Route path="/employees"            element={<AdminRoute><Employees /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
