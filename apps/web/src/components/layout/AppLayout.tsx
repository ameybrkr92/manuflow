import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f1117' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', margin: '0 auto 12px' }} className="spinner" />
        <div style={{ color: '#64748b', fontSize: 14 }}>Loading ManuFlow...</div>
      </div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220, minHeight: '100vh', background: '#0f1117' }}>
        <Outlet />
      </main>
    </div>
  );
}
