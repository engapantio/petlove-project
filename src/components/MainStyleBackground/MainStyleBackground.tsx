import type { ReactNode } from 'react';
import styles from './MainStyleBackground.module.css';

interface MainStyleBackgroundProps {
  children?: ReactNode;
  /** Optional extra class on the outer wrap (e.g. main element) */
  className?: string;
  /** Main route uses high for LCP; loader overlay can use low. */
  heroFetchPriority?: 'high' | 'low' | 'auto';
}

export const MainStyleBackground = ({
  children,
  className,
  heroFetchPriority = 'auto',
}: MainStyleBackgroundProps) => (
  <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
    <div className={styles.bgStack}>
      <picture className={styles.bgPicture}>
        <source media="(min-width: 1280px)" srcSet="/images/Desktop-Main-image.webp" />
        <source media="(min-width: 768px)" srcSet="/images/Tablet-Main-image.webp" />
        <img
          className={styles.bgImg}
          src="/images/Mobile-Main-image.webp"
          alt=""
          width={375}
          height={812}
          decoding="async"
          fetchPriority={heroFetchPriority}
        />
      </picture>
      <div className={styles.overlay} aria-hidden="true" />
      {children != null ? <div className={styles.content}>{children}</div> : null}
    </div>
  </div>
);
