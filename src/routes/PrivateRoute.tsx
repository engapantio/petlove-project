import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

interface PrivateRouteProps {
  component: React.ReactElement;
  redirectTo?: string;
}

/** Only accessible when user IS logged in. Redirects to /login otherwise. */
const PrivateRoute = ({ component, redirectTo = '/login' }: PrivateRouteProps) => {
  const { isLoggedIn, isRefreshing } = useAppSelector((s) => s.auth);

  // While token is being validated on app mount, render nothing
  if (isRefreshing) return null;

  return isLoggedIn ? component : <Navigate to={redirectTo} replace />;
};

export default PrivateRoute;
