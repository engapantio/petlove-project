import { instance } from './axiosInstance';

export interface CityOption {
  value: string;
  label: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const getString = (v: unknown): string => (typeof v === 'string' ? v : '');

/**
 * Search cities by free-text input.
 * Backend (Swagger): GET /cities/?keyword={string} (min length: 3)
 */
export const searchCitiesApi = async (value: string): Promise<CityOption[]> => {
  const params = new URLSearchParams();
  params.set('keyword', value);

  // axiosInstance BASE_URL ends with '/', so avoid leading '/' to prevent '//cities/...'
  const { data } = await instance.get<unknown>(`cities/?${params.toString()}`);

  if (!Array.isArray(data)) return [];

  return data
    .map((raw): CityOption | null => {
      if (!isRecord(raw)) return null;

      const id = getString(raw._id) || getString(raw.id);
      if (!id) return null;

      // Swagger sample: { cityEn, stateEn, countyEn }
      const city = getString(raw.cityEn) || getString(raw.city) || getString(raw.name) || getString(raw.label);
      const state = getString(raw.stateEn) || getString(raw.state) || getString(raw.region);
      const county = getString(raw.countyEn) || getString(raw.county);

      const labelParts = [city, state, county].filter((p) => p && p.trim().length > 0);
      const label = labelParts.length > 0 ? labelParts.join(', ') : id;
      return { value: id, label };
    })
    .filter((v): v is CityOption => Boolean(v));
};

