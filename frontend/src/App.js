import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import BranchDashboard from './components/BranchDashboard';
import StockIn from './components/StockIn';
import Stockout from './components/Stockout';
import Services from './components/Services';
import Report from './components/Report';
import LoginPage from './components/LoginPage';
import UserManagement from './components/UserManagement';
import Clients from './components/Clients';
import Expensive from './components/Expensive';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ wait before rendering routes

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null; // Or show a loader/spinner

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setUser={setUser} />} />

<Route
  path="/app"
  element={user ? <Layout user={user} /> : <Navigate to="/" />}
>
  <Route path="dashboard" element={
    user?.role === 'admin' ? <AdminDashboard /> :
    user?.role === 'engineer' ? <UserDashboard /> :
    user?.role === 'user' ? <BranchDashboard /> :
    <div>Unauthorized</div>
  } />

  {user?.role === 'admin' && (
    <>
      <Route path="stockin" element={<StockIn />} />
      <Route path="stockout" element={<Stockout />} />
      <Route path="services" element={<Services />} />
      <Route path="report" element={<Report />} />
      <Route path="clients" element={<Clients />} />
      <Route path="user-management" element={<UserManagement />} />
    </>
  )}

  {user?.role === 'engineer' && (
    <>
      <Route path="stockin" element={<StockIn />} />
      <Route path="stockout" element={<Stockout />} />
      <Route path="expensive" element={<Expensive />} />
      <Route path="services" element={<Services />} />
    </>
  )}

  {user?.role === 'user' && (
    <>
      <Route path="stockin" element={<StockIn />} />
      <Route path="stockout" element={<Stockout />} />
      <Route path="services" element={<Services />} />
    </>
  )}

  <Route path="*" element={<Navigate to="/app/dashboard" />} />
</Route>

        {/* Fallback for non-matching routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
