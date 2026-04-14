import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { logout } from '../../store/slices/authSlice';
import { Icon } from '../Icon/Icon';
import { LogoutConfirmModal } from '../LogoutConfirmModal';
import { NavMenu, MENU_ID } from './NavMenu';
import styles from './Header.module.css';

export type HeaderSurface = 'default' | 'homePrimary';

interface HeaderProps {
  /** On Home hero orange card: transparent bar, light nav (Figma Home). */
  surface?: HeaderSurface;
}

const Header = ({ surface = 'default' }: HeaderProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, isLoading } = useAppSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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

  const requestLogout = () => {
    setMenuOpenPath(null);
    setMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await dispatch(logout());
    navigate('/home');
  };

  const onPrimary = surface === 'homePrimary';

  const navClass = ({ isActive }: { isActive: boolean }) =>
    [
      styles.navLink,
      onPrimary && styles.navLinkOnPrimary,
      isActive && (onPrimary ? styles.navLinkActiveOnPrimary : styles.navLinkActive),
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <header
      className={[styles.header, onPrimary && styles.headerHomePrimary].filter(Boolean).join(' ')}
    >
      <div className={styles.headerInner}>
        <NavLink
          to="/home"
          className={[styles.logo, onPrimary && styles.logoOnPrimary].filter(Boolean).join(' ')}
          aria-label="Petlove home"
        >
          <span className={styles.logoWordmark}>
            petl
            <Icon
              id="heart-filled"
              width={28}
              height={28}
              className={[styles.logoHeart, onPrimary && styles.logoHeartOnPrimary]
                .filter(Boolean)
                .join(' ')}
            />
            ve
          </span>
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
            <div
              className={[styles.authBlock, onPrimary && styles.authBlockOnPrimary]
                .filter(Boolean)
                .join(' ')}
            >
              <NavLink
                to="/profile"
                className={[styles.avatarLink, onPrimary && styles.avatarLinkOnPrimary]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`Profile: ${user?.name ?? 'My profile'}`}
              >
                <span className={styles.avatarCircle} aria-hidden="true">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className={styles.avatarImage}
                      width={50}
                      height={50}
                      loading="lazy"
                    />
                  ) : (
                    <Icon id="user-02" width={20} height={20} className={styles.avatarIcon} />
                  )}
                </span>
                <span className={styles.avatarName}>{user?.name}</span>
              </NavLink>
              <button
                type="button"
                className={[styles.logoutBtnHeader, onPrimary && styles.logoutBtnHeaderOnPrimary]
                  .filter(Boolean)
                  .join(' ')}
                onClick={requestLogout}
              >
                LOG OUT
              </button>
            </div>
          ) : (
            <div
              className={[styles.authBar, onPrimary && styles.authBarOnPrimary]
                .filter(Boolean)
                .join(' ')}
              aria-label="Account"
            >
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
            className={[styles.burger, onPrimary && styles.burgerOnPrimary].filter(Boolean).join(' ')}
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
          onLogout={requestLogout}
          variant={isHomePage ? 'home' : 'internal'}
        />
      )}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        isLoading={isLoading}
        onConfirm={() => void confirmLogout()}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </header>
  );
};

export default Header;
