import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { Icon } from '../Icon/Icon';
import styles from './NavMenu.module.css';

/** 'home' → white panel; 'internal' → gold panel */
export type NavMenuVariant = 'home' | 'internal';

interface NavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogout: () => void | Promise<void>;
  variant: NavMenuVariant;
}

const MENU_ID = 'primary-navigation-menu';

export const NavMenu = ({
  isOpen,
  onClose,
  isLoggedIn,
  onLogout,
  variant,
}: NavMenuProps): React.ReactElement | null => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const currentPaddingRight = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const isHome = variant === 'home';

  const panelClass = [styles.panel, isHome ? styles.panelHome : styles.panelInternal]
    .join(' ');

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      styles.link,
      isHome ? styles.linkHome : styles.linkInternal,
      isActive ? (isHome ? styles.linkHomeActive : styles.linkInternalActive) : '',
    ]
      .filter(Boolean)
      .join(' ');

  const node = (
    <div className={styles.root} id={MENU_ID}>
      <button type="button" className={styles.scrim} onClick={onClose} aria-label="Close menu" />
      <div className={panelClass} role="dialog" aria-modal="true" aria-label="Site navigation">
        <div className={styles.topBar}>
          <button
            ref={closeBtnRef}
            type="button"
            className={[styles.closeBtn, isHome ? styles.closeBtnHome : styles.closeBtnInternal].join(' ')}
            onClick={onClose}
            aria-label="Close menu"
          >
            <Icon id="close" width={28} height={28} />
          </button>
        </div>

        <ul className={styles.nav} role="list">
          <li>
            <NavLink to="/news" className={linkClass} onClick={onClose}>
              News
            </NavLink>
          </li>
          <li>
            <NavLink to="/notices" className={linkClass} onClick={onClose}>
              Find pet
            </NavLink>
          </li>
          <li>
            <NavLink to="/friends" className={linkClass} onClick={onClose}>
              Our friends
            </NavLink>
          </li>
        </ul>

        <div className={styles.bottom}>
          {isLoggedIn ? (
            /* Auth: only logout — no avatar or name in drawer */
            <button
              type="button"
              className={[styles.logoutBtn, isHome ? styles.logoutBtnHome : styles.logoutBtnInternal].join(' ')}
              onClick={() => void onLogout()}
            >
              LOG OUT
            </button>
          ) : (
            /* Unauth: Log In + Registration */
            <div className={styles.bottomRow}>
              <NavLink
                to="/login"
                className={[styles.authPrimary, isHome ? styles.authPrimaryHome : styles.authPrimaryInternal].join(' ')}
                onClick={onClose}
              >
                LOG IN
              </NavLink>
              <NavLink
                to="/register"
                className={[styles.authSecondary, isHome ? styles.authSecondaryHome : styles.authSecondaryInternal].join(' ')}
                onClick={onClose}
              >
                REGISTRATION
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
};

export { MENU_ID };
