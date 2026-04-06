import {
  useEffect,
  useCallback,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  /** Controls visibility; the parent owns open/closed state. */
  isOpen:    boolean;
  /** Called when backdrop, ✕ button, or Escape are activated. */
  onClose:   () => void;
  /** Optional accessible title rendered as an <h2> and linked via aria-labelledby. */
  title?:    string;
  children:  ReactNode;
  /** Extra class applied to the dialog panel (for per-modal sizing). */
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: ModalProps): React.ReactElement | null => {
  const dialogRef   = useRef<HTMLDivElement>(null);
  const titleId     = 'modal-title';
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ── Escape key ───────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  // ── Side effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Save current focus to restore on close
    previousFocusRef.current = document.activeElement as HTMLElement;

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';   // prevent background scroll

    // Move focus into the dialog
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  // ── Backdrop click (only the overlay layer, not the panel) ───────────────────
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ── Internal Escape via React synthetic events (dialog panel) ────────────────
  const handleDialogKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  // ── Portal target ─────────────────────────────────────────────────────────────
  const portalTarget = document.getElementById('modal-root') ?? document.body;

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        ref={dialogRef}
        className={`${styles.panel} ${className}`.trim()}
        onKeyDown={handleDialogKeyDown}
        tabIndex={-1}             /* makes the panel programmatically focusable */
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className={styles.header}>
          {title && (
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    portalTarget,
  );
};
