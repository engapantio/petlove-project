import styles from './Icon.module.css';

/**
 * SVG Sprite Icon
 *
 * Usage:
 *   <Icon id="heart"    width={24} height={24} />
 *   <Icon id="search"   width={20} height={20} className={styles.searchIcon} />
 *
 * The sprite file must be served as a static asset at /icons/sprite.svg.
 * In Vite: place it in public/icons/sprite.svg — Vite serves public/ at root.
 *
 * Each symbol in the sprite must follow the naming convention:
 *   <symbol id="icon-{name}" viewBox="0 0 24 24"> ... </symbol>
 *
 * Icon names available: heart, heart-filled, search, close, eye, eye-off,
 *   trash, arrow-left, arrow-right, arrow-first, arrow-last, edit, logout, plus,
 *   check, cross-small, phone, mail, link-external
 */

// ── Allowed icon names (keep in sync with sprite.svg) ────────────────────────
export type IconName =
  | 'heart'
  | 'heart-filled'
  | 'search'
  | 'close'
  | 'eye'
  | 'eye-off'
  | 'trash'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-first'
  | 'arrow-last'
  | 'edit'
  | 'logout'
  | 'plus'
  | 'check'
  | 'cross-small'
  | 'phone'
  | 'mail'
  | 'link-external';

interface IconProps {
  id:          IconName;
  width?:      number;
  height?:     number;
  /** Override fill/stroke colour via CSS currentColor */
  className?:  string;
  /** Accessible label — omit for decorative icons */
  label?:      string;
}

const SPRITE_URL = '/icons/sprite.svg';

export const Icon = ({
  id,
  width  = 24,
  height = 24,
  className = '',
  label,
}: IconProps): React.ReactElement => (
  <svg
    className={`${styles.icon} ${className}`.trim()}
    width={width}
    height={height}
    aria-hidden={label ? undefined : true}
    aria-label={label}
    role={label ? 'img' : undefined}
    focusable="false"
  >
    <use href={`${SPRITE_URL}#icon-${id}`} />
  </svg>
);
