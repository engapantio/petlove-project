import {
  useEffect,
  useCallback,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import styles from './Modal.module.css';

let openModalCount = 0;
let previousBodyOverflow = '';
let previousBodyPaddingRight = '';
let previousHtmlOverflow = '';

const lockDocumentScroll = (): void => {
  if (openModalCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    previousBodyOverflow = body.style.overflow;
    previousBodyPaddingRight = body.style.paddingRight;
    previousHtmlOverflow = html.style.overflow;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      const currentBodyPaddingRight = window.getComputedStyle(body).paddingRight;
      const numericPadding = Number.parseFloat(currentBodyPaddingRight) || 0;
      body.style.paddingRight = `${numericPadding + scrollbarWidth}px`;
    }
  }

  openModalCount += 1;
};

const unlockDocumentScroll = (): void => {
  openModalCount = Math.max(0, openModalCount - 1);

  if (openModalCount === 0) {
    const html = document.documentElement;
    const body = document.body;

    body.style.overflow = previousBodyOverflow;
    body.style.paddingRight = previousBodyPaddingRight;
    html.style.overflow = previousHtmlOverflow;
  }
};

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
  /** Extra class applied to header wrapper. */
  headerClassName?: string;
  /** Extra class applied to close button. */
  closeButtonClassName?: string;
  /** Extra class applied to body wrapper. */
  bodyClassName?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  headerClassName = '',
  closeButtonClassName = '',
  bodyClassName = '',
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
    lockDocumentScroll();

    // Move focus into the dialog
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockDocumentScroll();
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
        <div className={`${styles.header} ${headerClassName}`.trim()}>
          {title && (
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`${styles.closeBtn} ${closeButtonClassName}`.trim()}
            aria-label="Close modal"
          >
            <Icon id="close" width={24} height={24} />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className={`${styles.body} ${bodyClassName}`.trim()}>{children}</div>
      </div>
    </div>,
    portalTarget,
  );
};
