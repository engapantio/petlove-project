import axios from 'axios';
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

const DEFAULT_API_BASE = 'https://petlove.b.goit.study/api';

const normalizeBaseUrl = (raw: string): string => {
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed.length > 0 ? `${trimmed}/` : `${DEFAULT_API_BASE}/`;
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
}

// ── Instance ──────────────────────────────────────────────────────────────────
const envBase =
  typeof import.meta.env.VITE_API_BASE_URL === 'string'
    ? import.meta.env.VITE_API_BASE_URL.trim()
    : '';

/** Reads `VITE_API_BASE_URL` at build time; falls back to hosted GoIT API. */
export const BASE_URL = normalizeBaseUrl(envBase.length > 0 ? envBase : DEFAULT_API_BASE);

export const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Token helpers (called by auth thunks) ─────────────────────────────────────
export const setAuthHeader = (token: string): void => {
  instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthHeader = (): void => {
  delete instance.defaults.headers.common['Authorization'];
};

// ── Request interceptor ───────────────────────────────────────────────────────
// The token is injected once by setAuthHeader() after login / refreshUser,
// so the request interceptor only needs to pass the config through.
// A dedicated store-subscriber approach (see store.ts) keeps the header
// always in sync — no circular import needed here.
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => config,
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────────────────────
instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status  = error.response?.status;
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred';

    // 401 — token is gone / expired; consumers handle redirect via isLoggedIn
    if (status === 401) {
      clearAuthHeader();
    }

    // Attach a clean Error so all thunks get (err as Error).message
    return Promise.reject(new Error(message));
  },
);
