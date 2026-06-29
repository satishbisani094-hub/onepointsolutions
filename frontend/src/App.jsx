import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

import Tasks from './pages/Tasks';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Customers from './pages/Customers';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import api from './utils/api';

const ProtectedRoute = () => {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token || user.role !== 'Admin') {
          if (isMounted) setAuthorized(false);
          return;
        }

        const response = await api.get('/auth/me');
        if (isMounted) {
          localStorage.setItem('user', JSON.stringify(response.data));
          setAuthorized(true);
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (isMounted) setAuthorized(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        Validating session...
      </div>
    );
  }

  return authorized ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="db-viewer" element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="staff" element={<Staff />} />
            <Route path="customers" element={<Customers />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
