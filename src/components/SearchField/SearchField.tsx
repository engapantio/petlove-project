import { type FormEvent, type ChangeEvent, useRef } from 'react';
import styles from './SearchField.module.css';

interface SearchFieldProps {
  value:        string;
  onChange:     (value: string) => void;
  onSearch:     (value: string) => void;
  placeholder?: string;
  /** aria-label for the wrapping form */
  label?:       string;
}

export const SearchField = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search…',
  label       = 'Search',
}: SearchFieldProps): React.ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    onChange('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const isEmpty = value.length === 0;

  return (
    <form
      role="search"
      aria-label={label}
      className={styles.form}
      onSubmit={handleSubmit}
    >
      <div className={styles.wrapper}>
        <input
          ref={inputRef}
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={placeholder}
          className={styles.input}
        />

        {/* Clear button — only when non-empty */}
        {!isEmpty && (
          <button
            type="button"
            onClick={handleClear}
            className={`${styles.iconBtn} ${styles.clearBtn}`}
            aria-label="Clear search"
          >
            {/* inline ✕ svg for zero-dependency portability */}
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {/* Search button */}
        <button
          type="submit"
          className={`${styles.iconBtn} ${styles.searchBtn}`}
          aria-label="Submit search"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
            <line x1="13.5" y1="13.5" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </form>
  );
};
