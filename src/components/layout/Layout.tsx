import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

const isHomeRoute = (pathname: string): boolean =>
  pathname === '/home' || pathname === '/';

const isMainRoute = (pathname: string): boolean => pathname === '/main';

const Layout = () => {
  const { pathname } = useLocation();
  const showGlobalHeader = !isHomeRoute(pathname) && !isMainRoute(pathname);

  return (
    <div className="pl-layout">
      {showGlobalHeader && <Header />}
      <main className="pl-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
