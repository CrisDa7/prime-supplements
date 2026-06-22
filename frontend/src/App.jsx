import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Ventas from './pages/Ventas';
import Ganancias from './pages/Ganancias';
import Stock from './pages/Stock';
import Usuarios from './pages/Usuarios';
import { IconMenu2 } from '@tabler/icons-react';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f0f]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <button
          onClick={() => setSidebarOpen(true)}
          className={`absolute top-3 left-3 z-30 md:hidden bg-[#111] border border-[#222] p-2 rounded-lg text-[#ccc] hover:text-white hover:bg-[#1a1a1a] transition-all ${sidebarOpen ? 'hidden' : ''}`}
        >
          <IconMenu2 size={20} />
        </button>
        {children}
      </main>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout><Dashboard /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos"
              element={
                <ProtectedRoute>
                  <AppLayout><Productos /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas"
              element={
                <ProtectedRoute>
                  <AppLayout><Ventas /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ganancias"
              element={
                <ProtectedRoute>
                  <AppLayout><Ganancias /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock"
              element={
                <ProtectedRoute>
                  <AppLayout><Stock /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <AppLayout><Usuarios /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
