import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function RequireAuth({ children }) {
  const { auth, t } = useApp();
  const location = useLocation();
  if (!auth.ready) return <p className="container py-5">{t('loading')}</p>;
  if (!auth.user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
