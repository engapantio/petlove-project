import { SearchField } from '../SearchField';
import { useEffect, useMemo, useState } from 'react';
import AsyncSelect from 'react-select/async';
import {
  components,
  type IndicatorsContainerProps,
  type GroupBase,
  type InputActionMeta,
} from 'react-select';
import Select from 'react-select';
import {
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

  // Keep UI and URL-derived locationId coherent without wiping user typing.
  useEffect(() => {
    let raf = 0;

    if (!values.location) {
      if (locationValue !== null) {
        raf = requestAnimationFrame(() => {
          setLocationValue(null);
          setLocationInput('');
        });
      }
    } else if (locationValue && locationValue.value !== values.location) {
      raf = requestAnimationFrame(() => {
        setLocationValue(null);
        setLocationInput('');
      });
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [locationValue, values.location]);

  const loadLocations = async (inputValue: string): Promise<CityOption[]> => {
    const q = inputValue.trim();
    if (q.length < 3) return [];
    return searchCitiesApi(q);
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
              value={values.search}
              onChange={(v) => onChange({ search: v })}
              onSearch={(v) => onChange({ search: v })}
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
                if (meta.action === 'input-change') setLocationInput(next);
                // When an option is selected, react-select may request input reset.
                if (meta.action === 'set-value') setLocationInput(next);
                return next;
              }}
              onChange={(opt) => {
                setLocationValue(opt ?? null);
                setLocationInput(opt?.label ?? '');
                onChange({ location: opt?.value ?? '' });
              }}
              placeholder={l.location}
              isClearable={false}
              inputId="notices-location"
              aria-label={l.location}
              noOptionsMessage={({ inputValue }) =>
                inputValue.trim().length < 3 ? 'Type at least 3 characters' : 'No locations found'
              }
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
        </div>
      </div>
    </section>
  );
};

