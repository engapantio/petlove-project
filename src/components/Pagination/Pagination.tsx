import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage:  number;
  totalPages:   number;
  onPageChange: (page: number) => void;
}

/** Build the visible page tokens: numbers + '…' ellipsis markers. */
const buildPages = (current: number, total: number): (number | '…')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];

  if (current > 3)              pages.push('…');
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) pages.push(i);
  if (current < total - 2)      pages.push('…');

  pages.push(total);
  return pages;
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps): React.ReactElement | null => {
  if (totalPages <= 1) return null;

  const pages = buildPages(currentPage, totalPages);

  const isFirst = currentPage === 1;
  const isLast  = currentPage === totalPages;

  const nav = (label: string, page: number, disabled: boolean, symbol: string) => (
    <button
      key={label}
      type="button"
      className={`${styles.btn} ${styles.nav}`}
      onClick={() => !disabled && onPageChange(page)}
      disabled={disabled}
      aria-label={label}
    >
      {symbol}
    </button>
  );

  return (
    <nav aria-label="Pagination" className={styles.root}>
      {nav('First page',    1,               isFirst, '«')}
      {nav('Previous page', currentPage - 1, isFirst, '‹')}

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

      {nav('Next page',  currentPage + 1, isLast, '›')}
      {nav('Last page',  totalPages,      isLast, '»')}
    </nav>
  );
};
