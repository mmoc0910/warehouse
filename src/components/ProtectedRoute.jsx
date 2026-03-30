import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, roles: currentRoles } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading">Đang tải...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles?.length && !roles.some((role) => currentRoles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
