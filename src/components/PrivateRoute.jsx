import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipLoader } from 'react-spinners';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ClipLoader color="#3b82f6" size={50} />
      </div>
    );
  }

  // Fallback: verificar localStorage por si el estado de React aún no se actualizó
  const hasToken = !!localStorage.getItem('token');
  const hasUser = !!localStorage.getItem('user');

  return (isAuthenticated || (hasToken && hasUser)) ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
