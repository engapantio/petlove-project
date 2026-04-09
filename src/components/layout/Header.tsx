import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { logout } from '../../store/slices/authSlice';
import { NavMenu, MENU_ID } from './NavMenu';
import styles from './Header.module.css';

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useAppSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);

  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const isHomePage = location.pathname === '/home' || location.pathname === '/';
  const isMenuOpen = !isDesktop && menuOpen && menuOpenPath === location.pathname;
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (!isDesktop || !menuOpen) return;

    const raf = requestAnimationFrame(() => {
      setMenuOpenPath(null);
      setMenuOpen(false);
    });

    return () => cancelAnimationFrame(raf);
  }, [isDesktop, menuOpen]);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    prevPathRef.current = location.pathname;

    if (!menuOpen || prevPath === location.pathname) return;

    const raf = requestAnimationFrame(() => {
      setMenuOpenPath(null);
      setMenuOpen(false);
    });

    return () => cancelAnimationFrame(raf);
  }, [location.pathname, menuOpen]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/home');
  };

  const handleMenuLogout = async () => {
    setMenuOpenPath(null);
    setMenuOpen(false);
    await dispatch(logout());
    navigate('/home');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ');

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <NavLink to="/home" className={styles.logo} aria-label="Petlove home">
          <span>petl❤️ve</span>
        </NavLink>

        <nav className={styles.navDesktop} aria-label="Main navigation">
          <NavLink to="/news" className={navClass}>
            News
          </NavLink>
          <NavLink to="/notices" className={navClass}>
            Find pet
          </NavLink>
          <NavLink to="/friends" className={navClass}>
            Our friends
          </NavLink>
        </nav>

        <div className={styles.headerTrailing}>
          {isLoggedIn ? (
            <div className={styles.authBlock}>
              <NavLink
                to="/profile"
                className={styles.avatarLink}
                aria-label={`Profile: ${user?.name ?? 'My profile'}`}
              >
                <span className={styles.avatarCircle} aria-hidden="true">
                  {userInitial}
                </span>
                <span className={styles.avatarName}>{user?.name}</span>
              </NavLink>
              <button
                type="button"
                className={styles.logoutBtnHeader}
                onClick={() => void handleLogout()}
              >
                LOG OUT
              </button>
            </div>
          ) : (
            <div className={styles.authBar} aria-label="Account">
              <NavLink to="/login" className="pl-btn pl-btn--primary">
                LOG IN
              </NavLink>
              <NavLink to="/register" className="pl-btn pl-btn--secondary">
                REGISTRATION
              </NavLink>
            </div>
          )}

          <button
            type="button"
            className={styles.burger}
            onClick={() =>
              setMenuOpen((o) => {
                const next = !o;
                setMenuOpenPath(next ? location.pathname : null);
                return next;
              })
            }
            aria-expanded={isMenuOpen}
            aria-controls={MENU_ID}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={styles.burgerBar} aria-hidden="true" />
            <span className={styles.burgerBar} aria-hidden="true" />
            <span className={styles.burgerBar} aria-hidden="true" />
          </button>
        </div>
      </div>

      {!isDesktop && (
        <NavMenu
          isOpen={isMenuOpen}
          onClose={() => {
            setMenuOpenPath(null);
            setMenuOpen(false);
          }}
          isLoggedIn={isLoggedIn}
          onLogout={() => void handleMenuLogout()}
          variant={isHomePage ? 'home' : 'internal'}
        />
      )}
    </header>
  );
};

export default Header;
