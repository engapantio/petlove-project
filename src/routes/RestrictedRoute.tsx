import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';

interface RestrictedRouteProps {
  component: React.ReactElement;
  redirectTo?: string;
}

/** Only accessible when user is NOT logged in (login/register pages).
 *  Redirects logged-in users to /profile. */
const RestrictedRoute = ({ component, redirectTo = '/profile' }: RestrictedRouteProps) => {
  const { isLoggedIn, isRefreshing } = useAppSelector((s) => s.auth);

  if (isRefreshing) return null;

  return !isLoggedIn ? component : <Navigate to={redirectTo} replace />;
};

export default RestrictedRoute;
