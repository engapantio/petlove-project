import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { RouteLoaderFallback } from '../components/Loader';

interface PrivateRouteProps {
  component: React.ReactElement;
  redirectTo?: string;
}

/** Only accessible when user IS logged in. Redirects to /login otherwise. */
const PrivateRoute = ({ component, redirectTo = '/login' }: PrivateRouteProps) => {
  const { isLoggedIn, isAuthInitialized } = useAppSelector((s) => s.auth);

  // Avoid premature redirects until auth bootstrap resolves.
  if (!isAuthInitialized) return <RouteLoaderFallback />;

  return isLoggedIn ? component : <Navigate to={redirectTo} replace />;
};

export default PrivateRoute;
