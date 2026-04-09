import { useEffect, useState } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage:  number;
  totalPages:   number;
  onPageChange: (page: number) => void;
}

const MOBILE_MQ = '(max-width: 767px)';

const getIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_MQ).matches;
};

/** Build the visible page tokens: numbers + '…' ellipsis markers (no explicit last page button). */
const buildPages = (current: number, total: number, maxNumbers: number): (number | '…')[] => {
  if (total <= maxNumbers) return Array.from({ length: total }, (_, i) => i + 1);

  // Keep current page always visible, plus neighbors up to maxNumbers.
  const half = Math.floor((maxNumbers - 1) / 2);
  let start = Math.max(1, current - half);
  let end = start + maxNumbers - 1;

  if (end > total) {
    end = total;
    start = end - maxNumbers + 1;
  }

  const pages: (number | '…')[] = [];
  for (let p = start; p <= end; p++) pages.push(p);

  // Add ellipsis markers when there are hidden pages at either end.
  if (start > 1) pages.unshift('…');
  if (end < total) pages.push('…');

  return pages;
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps): React.ReactElement | null => {
  const [mobile, setMobile] = useState(getIsMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia(MOBILE_MQ);
    const handler = () => setMobile(mq.matches);

    handler();

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (totalPages <= 1) return null;

  const maxNumbers = mobile ? 2 : 3;
  const pages = buildPages(currentPage, totalPages, maxNumbers);

  const isFirst = currentPage === 1;
  const isLast  = currentPage === totalPages;

  const nav = (label: string, page: number, disabled: boolean, iconId: Parameters<typeof Icon>[0]['id']) => (
    <button
      key={label}
      type="button"
      className={`${styles.btn} ${styles.nav}`}
      onClick={() => !disabled && onPageChange(page)}
      disabled={disabled}
      aria-label={label}
    >
      <Icon id={iconId} width={20} height={20} />
    </button>
  );

  return (
    <nav aria-label="Pagination" className={styles.root}>
      {nav('First page',    1,               isFirst, 'arrow-first')}
      {nav('Previous page', currentPage - 1, isFirst, 'arrow-left')}

      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`ellipsis-${idx}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`${styles.btn} ${p === currentPage ? styles.active : ''}`}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}

      {nav('Next page',  currentPage + 1, isLast, 'arrow-right')}
      {nav('Last page',  totalPages,      isLast, 'arrow-last')}
    </nav>
  );
};
