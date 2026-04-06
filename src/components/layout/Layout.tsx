import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => (
  <div className="pl-layout">
    <Header />
    <main className="pl-main">
      <Outlet />
    </main>
  </div>
);

export default Layout;
