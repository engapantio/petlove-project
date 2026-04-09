import { type FormEvent, type ChangeEvent, useRef } from 'react';
import { Icon } from '../Icon/Icon';
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
            <Icon id="cross-small" width={16} height={16} />
          </button>
        )}

        {/* Search button */}
        <button
          type="submit"
          className={`${styles.iconBtn} ${styles.searchBtn}`}
          aria-label="Submit search"
        >
          <Icon id="search" width={20} height={20} />
        </button>
      </div>
    </form>
  );
};
