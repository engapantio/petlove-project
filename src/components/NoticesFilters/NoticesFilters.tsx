import { SearchField } from '../SearchField';
import css from './NoticesFilters.module.css';

export type NoticesSortKey = 'popular' | 'unpopular' | 'cheap' | 'expensive' | null;

interface NoticesFiltersValues {
  search: string;
  category: string;
  gender: string;
  type: string;
  location: string;
  sort: NoticesSortKey;
}

interface SelectOption {
  value: string;
  label: string;
}

interface NoticesFiltersProps {
  values: NoticesFiltersValues;
  onChange: (patch: Partial<NoticesFiltersValues>) => void;

  categoryOptions?: SelectOption[];
  genderOptions?: SelectOption[];
  typeOptions?: SelectOption[];

  /** Placeholder labels (Figma uses: Search, Category, By gender, By type, Location) */
  labels?: Partial<Record<keyof Omit<NoticesFiltersValues, 'sort'>, string>>;
}

export const NoticesFilters = ({
  values,
  onChange,
  categoryOptions = [],
  genderOptions = [],
  typeOptions = [],
  labels,
}: NoticesFiltersProps): React.ReactElement => {
  const l = {
    search: labels?.search ?? 'Search',
    category: labels?.category ?? 'Category',
    gender: labels?.gender ?? 'By gender',
    type: labels?.type ?? 'By type',
    location: labels?.location ?? 'Location',
  };

  const setSort = (sort: NoticesSortKey) => {
    onChange({ sort: values.sort === sort ? null : sort });
  };

  return (
    <section className={css.section} aria-label="Notices filters">
      <div className={css.panel}>
        <div className={css.controls}>
          <div className={css.search}>
            <SearchField
              value={values.search}
              onChange={(v) => onChange({ search: v })}
              onSearch={(v) => onChange({ search: v })}
              placeholder={l.search}
              label="Search notices"
            />
          </div>

          <label className={css.selectWrap} aria-label={l.category}>
            <select
              className={css.select}
              value={values.category}
              onChange={(e) => onChange({ category: e.target.value })}
            >
              <option value="">{l.category}</option>
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className={css.selectWrap} aria-label={l.gender}>
            <select
              className={css.select}
              value={values.gender}
              onChange={(e) => onChange({ gender: e.target.value })}
            >
              <option value="">{l.gender}</option>
              {genderOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className={css.selectWrap} aria-label={l.type}>
            <select
              className={css.select}
              value={values.type}
              onChange={(e) => onChange({ type: e.target.value })}
            >
              <option value="">{l.type}</option>
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className={css.locationWrap} aria-label={l.location}>
            <input
              className={css.location}
              value={values.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder={l.location}
              autoComplete="off"
            />
          </label>
        </div>

        <div className={css.sortRow} aria-label="Sort">
          <button
            type="button"
            className={`${css.pill} ${css.pillPopular} ${values.sort === 'popular' ? css.pillActive : ''}`}
            onClick={() => setSort('popular')}
          >
            Popular
          </button>
          <button
            type="button"
            className={`${css.pill} ${css.pillUnpopular} ${values.sort === 'unpopular' ? css.pillActive : ''}`}
            onClick={() => setSort('unpopular')}
          >
            Unpopular
          </button>
          <button
            type="button"
            className={`${css.pill} ${css.pillCheap} ${values.sort === 'cheap' ? css.pillActive : ''}`}
            onClick={() => setSort('cheap')}
          >
            Cheap
          </button>
          <button
            type="button"
            className={`${css.pill} ${css.pillExpensive} ${values.sort === 'expensive' ? css.pillActive : ''}`}
            onClick={() => setSort('expensive')}
          >
            Expensive
          </button>
        </div>
      </div>
    </section>
  );
};

