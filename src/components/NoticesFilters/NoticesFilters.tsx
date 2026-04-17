import { SearchField } from '../SearchField';
import { useEffect, useMemo, useRef, useState } from 'react';
import AsyncSelect from 'react-select/async';
import {
  components,
  type FormatOptionLabelMeta,
  type IndicatorsContainerProps,
  type GroupBase,
  type InputActionMeta,
} from 'react-select';
import Select from 'react-select';
import {
  fetchCityLocationsApi,
  searchCitiesApi,
  type CityOption,
} from '../../api/cities';
import { Icon } from '../Icon';
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

const locationOptionCache = new Map<string, CityOption>();

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

  const hasActiveFilters = Boolean(
    values.search ||
    values.category ||
    values.gender ||
    values.type ||
    values.location ||
    values.sort,
  );

  type SimpleOption = { value: string; label: string };

  const SelectChevron = (): React.ReactElement => (
    <span className={css.selectChevron} aria-hidden="true" />
  );

  const toSelectValue = (opts: SelectOption[], value: string): SimpleOption | null => {
    // Keep placeholder visible when no filter selected.
    if (!value) return null;
    const found = opts.find((o) => o.value === value);
    return found ? { value: found.value, label: found.label } : null;
  };

  const toSelectOptions = (opts: SelectOption[]): SimpleOption[] => [
    { value: '', label: 'Show all' },
    ...opts.map((o) => ({ value: o.value, label: o.label })),
  ];

  const [locationInput, setLocationInput] = useState('');
  const [locationValue, setLocationValue] = useState<CityOption | null>(null);
  const locationCacheRef = useRef(locationOptionCache);
  const attemptedLocationHydrationRef = useRef(new Set<string>());
  const previousLocationRef = useRef(values.location);
  const [searchInput, setSearchInput] = useState(values.search);
  const lastSubmittedSearchRef = useRef(values.search);

  useEffect(() => {
    if (values.search === lastSubmittedSearchRef.current) return;
    const raf = requestAnimationFrame(() => {
      setSearchInput(values.search);
      lastSubmittedSearchRef.current = values.search;
    });
    return () => cancelAnimationFrame(raf);
  }, [values.search]);

  // Keep UI and URL-derived locationId coherent without wiping user typing.
  useEffect(() => {
    let raf = 0;
    let isActive = true;
    const locationWasClearedFromUrl = Boolean(previousLocationRef.current) && !values.location;

    if (!values.location) {
      // Clear visible selection/query only when URL location was just cleared
      // or a selected option is still mounted.
      if (locationValue !== null || locationWasClearedFromUrl) {
        raf = requestAnimationFrame(() => {
          setLocationValue(null);
          setLocationInput('');
        });
      }
    } else if (!locationValue || locationValue.value !== values.location) {
      const cached = locationCacheRef.current.get(values.location);
      if (cached) {
        raf = requestAnimationFrame(() => {
          setLocationValue(cached);
        });
      } else if (!attemptedLocationHydrationRef.current.has(values.location)) {
        attemptedLocationHydrationRef.current.add(values.location);
        void (async () => {
          const allLocations = await fetchCityLocationsApi();
          if (!isActive) return;
          allLocations.forEach((option) => locationCacheRef.current.set(option.value, option));
          const resolved = locationCacheRef.current.get(values.location);
          if (!resolved) return;
          raf = requestAnimationFrame(() => {
            setLocationValue(resolved);
          });
        })();
      }
    }
    previousLocationRef.current = values.location;

    return () => {
      isActive = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [locationValue, values.location]);

  const loadLocations = async (inputValue: string): Promise<CityOption[]> => {
    const q = inputValue.trim();
    if (q.length < 3) return [];
    const items = await searchCitiesApi(q);
    items.forEach((item) => locationCacheRef.current.set(item.value, item));
    return items;
  };

  const normalizeLocationText = (value: string): string =>
    value.toLowerCase().trim().replace(/\s+/g, ' ');

  const getHighlightedLocationLabel = (label: string, input: string): React.ReactNode => {
    const normalizedInput = normalizeLocationText(input);
    if (normalizedInput.length < 3) {
      return <span className={css.locationLabelRest}>{label}</span>;
    }

    const normalizedLabel = normalizeLocationText(label);
    if (!normalizedLabel.startsWith(normalizedInput)) {
      return <span className={css.locationLabelRest}>{label}</span>;
    }

    const normalizedTypedLength = normalizedInput.length;
    const typedPart = label.slice(0, normalizedTypedLength);
    const restPart = label.slice(normalizedTypedLength);

    return (
      <>
        <span className={css.locationLabelTyped}>{typedPart}</span>
        <span className={css.locationLabelRest}>{restPart}</span>
      </>
    );
  };

  const handleReset = () => {
    setSearchInput('');
    lastSubmittedSearchRef.current = '';
    setLocationInput('');
    setLocationValue(null);
    onChange({
      search: '',
      category: '',
      gender: '',
      type: '',
      location: '',
      sort: null,
    });
  };

  type CityGroup = GroupBase<CityOption>;

  const LocationIndicators = useMemo(() => {
    const Comp = (props: IndicatorsContainerProps<CityOption, false, CityGroup>) => {
      const showClear = Boolean(locationInput.trim()) || Boolean(locationValue);

      return (
        <components.IndicatorsContainer {...props}>
          {showClear ? (
            <button
              type="button"
              className={css.locationClearBtn}
              aria-label="Clear location"
              onMouseDown={(e) => {
                // Prevent control blur; keep keyboard focus behavior intact.
                e.preventDefault();
              }}
              onClick={() => {
                setLocationValue(null);
                setLocationInput('');
                onChange({ location: '' });
              }}
            >
              <Icon id="cross-small" width={18} height={18} />
            </button>
          ) : null}

          <div className={css.locationSearchIcon} aria-hidden="true">
            <Icon id="search" width={18} height={18} />
          </div>
        </components.IndicatorsContainer>
      );
    };
    return Comp;
  }, [locationInput, locationValue, onChange]);

  return (
    <section className={css.section} aria-label="Notices filters">
      <div className={css.panel}>
        <div className={css.controls}>
          <div className={css.search}>
            <SearchField
              value={searchInput}
              onChange={(v) => {
                setSearchInput(v);
                lastSubmittedSearchRef.current = v;
                onChange({ search: v });
              }}
              onSearch={(v) => {
                setSearchInput(v);
                lastSubmittedSearchRef.current = v;
                onChange({ search: v });
              }}
              placeholder={l.search}
              label="Search notices"
            />
          </div>

          <div className={`${css.selectWrap} ${css.category}`.trim()} aria-label={l.category}>
            <Select<SimpleOption, false>
              className={css.fieldSelect}
              classNamePrefix="field"
              options={toSelectOptions(categoryOptions)}
              value={toSelectValue(categoryOptions, values.category)}
              onChange={(opt) => onChange({ category: opt?.value ?? '' })}
              placeholder={l.category}
              isSearchable={false}
              components={{ IndicatorSeparator: null, DropdownIndicator: SelectChevron }}
            />
          </div>

          <div className={`${css.selectWrap} ${css.gender}`.trim()} aria-label={l.gender}>
            <Select<SimpleOption, false>
              className={css.fieldSelect}
              classNamePrefix="field"
              options={toSelectOptions(genderOptions)}
              value={toSelectValue(genderOptions, values.gender)}
              onChange={(opt) => onChange({ gender: opt?.value ?? '' })}
              placeholder={l.gender}
              isSearchable={false}
              components={{ IndicatorSeparator: null, DropdownIndicator: SelectChevron }}
            />
          </div>

          <div className={`${css.selectWrap} ${css.type}`.trim()} aria-label={l.type}>
            <Select<SimpleOption, false>
              className={css.fieldSelect}
              classNamePrefix="field"
              options={toSelectOptions(typeOptions)}
              value={toSelectValue(typeOptions, values.type)}
              onChange={(opt) => onChange({ type: opt?.value ?? '' })}
              placeholder={l.type}
              isSearchable={false}
              components={{ IndicatorSeparator: null, DropdownIndicator: SelectChevron }}
            />
          </div>

          <div className={css.locationWrap} aria-label={l.location}>
            <AsyncSelect<CityOption, false>
              className={css.locationSelect}
              classNamePrefix="location"
              cacheOptions
              defaultOptions={false}
              loadOptions={loadLocations}
              value={locationValue}
              inputValue={locationInput}
              onInputChange={(next, meta: InputActionMeta) => {
                // Keep typing visible and searchable.
                if (meta.action === 'input-change') {
                  setLocationInput(next);
                  // Drop URL + internal value whenever the user edits the field (including
                  // clearing to empty). Selection from the menu uses `set-value`, not
                  // `input-change`, so we do not clear right after picking an option.
                  if (locationValue) {
                    setLocationValue(null);
                    onChange({ location: '' });
                  }
                }
                return next;
              }}
              onChange={(opt) => {
                if (opt) locationCacheRef.current.set(opt.value, opt);
                setLocationValue(opt ?? null);
                setLocationInput('');
                onChange({ location: opt?.value ?? '' });
              }}
              placeholder={l.location}
              isClearable={false}
              inputId="notices-location"
              aria-label={l.location}
              noOptionsMessage={({ inputValue }) =>
                inputValue.trim().length < 3 ? 'Type at least 3 characters' : 'No locations found'
              }
              formatOptionLabel={(option: CityOption, meta: FormatOptionLabelMeta<CityOption>) => {
                if (meta.context === 'value') {
                  return <span className={css.locationLabelTyped}>{option.label}</span>;
                }
                const query = meta.inputValue || locationInput;
                return getHighlightedLocationLabel(option.label, query);
              }}
              components={{
                DropdownIndicator: null,
                IndicatorSeparator: null,
                IndicatorsContainer: LocationIndicators,
              }}
            />
          </div>
        </div>

        <div className={css.sortRow} aria-label="Sort">
          <button
            type="button"
            className={`${css.pill} ${css.pillPopular} ${values.sort === 'popular' ? css.pillActive : ''}`}
            onClick={() => setSort('popular')}
          >
            <span className={css.pillText}>Popular</span>
            {values.sort === 'popular' ? (
              <span className={css.pillIcon} aria-hidden="true">
                <Icon id="cross-small" width={18} height={18} />
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className={`${css.pill} ${css.pillUnpopular} ${values.sort === 'unpopular' ? css.pillActive : ''}`}
            onClick={() => setSort('unpopular')}
          >
            <span className={css.pillText}>Unpopular</span>
            {values.sort === 'unpopular' ? (
              <span className={css.pillIcon} aria-hidden="true">
                <Icon id="cross-small" width={18} height={18} />
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className={`${css.pill} ${css.pillCheap} ${values.sort === 'cheap' ? css.pillActive : ''}`}
            onClick={() => setSort('cheap')}
          >
            <span className={css.pillText}>Cheap</span>
            {values.sort === 'cheap' ? (
              <span className={css.pillIcon} aria-hidden="true">
                <Icon id="cross-small" width={18} height={18} />
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className={`${css.pill} ${css.pillExpensive} ${values.sort === 'expensive' ? css.pillActive : ''}`}
            onClick={() => setSort('expensive')}
          >
            <span className={css.pillText}>Expensive</span>
            {values.sort === 'expensive' ? (
              <span className={css.pillIcon} aria-hidden="true">
                <Icon id="cross-small" width={18} height={18} />
              </span>
            ) : null}
          </button>
          {hasActiveFilters ? (
            <button
              type="button"
              className={css.resetButton}
              onClick={handleReset}
              aria-label="Reset all notices filters"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
};

