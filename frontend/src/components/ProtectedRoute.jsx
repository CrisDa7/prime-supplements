import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d0d0d]">
        <div className="text-[#555] text-sm">Cargando...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
