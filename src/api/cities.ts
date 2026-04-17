import { instance } from './axiosInstance';

export interface CityOption {
  value: string;
  label: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const getString = (v: unknown): string => (typeof v === 'string' ? v : '');

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const normalizeKeyword = (value: string): string =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 48);

const buildCityLabel = (raw: Record<string, unknown>, fallback: string): string => {
  const city =
    getString(raw.cityEn)
    || getString(raw.cityUk)
    || getString(raw.city)
    || getString(raw.name)
    || getString(raw.label);
  const state = getString(raw.stateEn) || getString(raw.stateUk) || getString(raw.state) || getString(raw.region);
  const county = getString(raw.countyEn) || getString(raw.countyUk) || getString(raw.county);

  const parts = [city, state, county].filter((part) => part && part.trim().length > 0);
  if (parts.length > 0) return parts.join(', ');
  return fallback;
};

const toCityOptions = (data: unknown): CityOption[] => {
  if (!Array.isArray(data)) return [];

  return data
    .map((raw): CityOption | null => {
      if (!isRecord(raw)) return null;

      const id =
        getString(raw._id)
        || getString(raw.id)
        || getString(raw.locationId)
        || getString(raw.value);
      if (!id) return null;

      const fallbackLabel = id;
      const label = buildCityLabel(raw, fallbackLabel);
      return { value: id, label };
    })
    .filter((item): item is CityOption => Boolean(item));
};

const dedupeCityOptions = (items: CityOption[]): CityOption[] => {
  const seenValues = new Set<string>();
  const seenLabels = new Set<string>();
  const result: CityOption[] = [];

  items.forEach((item) => {
    if (seenValues.has(item.value)) return;
    const normalizedLabel = normalizeText(item.label);
    if (seenLabels.has(normalizedLabel)) return;

    seenValues.add(item.value);
    seenLabels.add(normalizedLabel);
    result.push(item);
  });

  return result;
};

const filterByPrefix = (options: CityOption[], query: string): CityOption[] => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  return options.filter((option) => normalizeText(option.label).startsWith(normalizedQuery));
};

const loadCitiesFromEndpoint = async (path: string): Promise<CityOption[]> => {
  const { data } = await instance.get<unknown>(path);
  return toCityOptions(data);
};

/**
 * GET /cities/locations
 * Full list used for default location suggestions.
 */
export const fetchCityLocationsApi = async (): Promise<CityOption[]> => {
  try {
    const locations = await loadCitiesFromEndpoint('/cities/locations');
    return dedupeCityOptions(locations);
  } catch {
    return [];
  }
};

/**
 * GET /cities?keyword={string}
 * Keyword search endpoint (min 3 chars, max 48 chars).
 */
export const searchCitiesApi = async (keyword: string): Promise<CityOption[]> => {
  const normalizedKeyword = normalizeKeyword(keyword);
  if (normalizedKeyword.length < 3) return [];

  try {
    const params = new URLSearchParams();
    params.set('keyword', normalizedKeyword);
    const results = await loadCitiesFromEndpoint(`/cities?${params.toString()}`);
    return filterByPrefix(dedupeCityOptions(results), normalizedKeyword);
  } catch {
    return [];
  }
};

export const filterCityOptions = (options: CityOption[], query: string): CityOption[] => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  return options.filter((option) => normalizeText(option.label).includes(normalizedQuery));
};

export const findCityOptionByValue = (options: CityOption[], value: string): CityOption | null =>
  options.find((option) => option.value === value) ?? null;

