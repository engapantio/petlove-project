import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { instance } from '../../api/axiosInstance';
import { logout, refreshUser } from './authSlice';
import type { NoticesState, NoticesFilters, NoticesFilterOptions, PaginatedResponse, Pet } from '../../types';

const initialFilterOptions: NoticesFilterOptions = {
  categories: [],
  sexOptions: [],
  speciesOptions: [],
};

const initialState: NoticesState = {
  items: [], favoriteIds: [],
  favoriteItems: [],
  favoriteRollbackCache: {},
  totalPages: 1, currentPage: 1,
  isLoading: false, error: null,
  filters: { search: '', category: '', gender: '', type: '', location: '', page: 1 },
  filterOptions: initialFilterOptions,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Coerce an unknown API response to a plain string array (handles string[] and object[]). */
const toStringArray = (data: unknown): string[] => {
  if (!Array.isArray(data)) return [];
  return data
    .map((v) => (typeof v === 'string' ? v : (v as Record<string, unknown>)?.name ?? String(v)))
    .filter(Boolean) as string[];
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchNotices = createAsyncThunk(
  'notices/fetchAll',
  async (filters: Partial<NoticesFilters>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      // Map UI field names → API query param names
      if (filters.search)      params.set('keyword',      filters.search);
      if (filters.category)    params.set('category',     filters.category);
      if (filters.gender)      params.set('sex',          filters.gender);
      if (filters.type)        params.set('species',      filters.type);
      if (filters.location)    params.set('locationId',   filters.location);
      if (filters.page)        params.set('page',         String(filters.page));
      if (filters.limit)       params.set('limit',        String(filters.limit));
      if (filters.sortBy)      params.set('sortBy',       filters.sortBy);
      if (filters.sortByOrder) params.set('sortByOrder',  filters.sortByOrder);

      const { data } = await instance.get<PaginatedResponse<Pet>>(`/notices?${params}`);
      return data;
    } catch (err: unknown) { return rejectWithValue((err as Error).message); }
  },
);

export const fetchNoticesOptions = createAsyncThunk(
  'notices/fetchOptions',
  async (_, { rejectWithValue }) => {
    try {
      const [cats, sexes, species] = await Promise.all([
        instance.get('/notices/categories'),
        instance.get('/notices/sex'),
        instance.get('/notices/species'),
      ]);
      return {
        categories:     toStringArray(cats.data),
        sexOptions:     toStringArray(sexes.data),
        speciesOptions: toStringArray(species.data),
      } satisfies NoticesFilterOptions;
    } catch (err: unknown) { return rejectWithValue((err as Error).message); }
  },
);

export const toggleFavorite = createAsyncThunk(
  'notices/toggleFavorite',
  async (
    { id, isFavorite }: { id: string; isFavorite: boolean },
    { rejectWithValue },
  ) => {
    try {
      // Correct paths per Swagger: /notices/favorites/add/:id  /notices/favorites/remove/:id
      // Both return string[] — the updated list of favourite notice IDs.
      if (isFavorite) {
        const { data } = await instance.delete<string[]>(`/notices/favorites/remove/${id}`);
        return { id, removed: true, favoriteIds: data };
      } else {
        const { data } = await instance.post<string[]>(`/notices/favorites/add/${id}`);
        return { id, removed: false, favoriteIds: data };
      }
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchFavoriteNotices = createAsyncThunk(
  'notices/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await instance.get<Pet[]>('/users/notices/favorites');
      return data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const noticesSlice = createSlice({
  name: 'notices',
  initialState,
  reducers: {
    setFilters(s, a: PayloadAction<Partial<NoticesFilters>>) { s.filters = { ...s.filters, ...a.payload }; },
    resetFilters(s) { s.filters = initialState.filters; },
    clearNoticesError(s) { s.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotices.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchNotices.fulfilled, (s, a) => {
        s.isLoading = false;
        s.items = a.payload.results;
        s.totalPages = a.payload.totalPages;
        s.currentPage = a.payload.page;
      })
      .addCase(fetchNotices.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });

    builder.addCase(fetchNoticesOptions.fulfilled, (s, a) => { s.filterOptions = a.payload; });

    // Seed favoriteIds from GET /users/current (already called by refreshUser on app start)
    builder.addCase(refreshUser.fulfilled, (s, a) => {
      s.favoriteIds = (a.payload.noticesFavorites ?? []).map((n) => n._id);
      s.favoriteItems = s.favoriteItems.filter((notice) => s.favoriteIds.includes(notice._id));
      s.favoriteRollbackCache = {};
    });

    builder.addCase(logout.fulfilled, (s) => {
      s.favoriteIds = [];
      s.favoriteItems = [];
      s.favoriteRollbackCache = {};
    });

    builder
      .addCase(fetchFavoriteNotices.fulfilled, (s, a) => {
        s.favoriteItems = a.payload;
        s.favoriteIds = a.payload.map((notice) => notice._id);
        s.favoriteRollbackCache = {};
      });

    builder
      // Optimistic: flip the heart immediately without waiting for the network
      .addCase(toggleFavorite.pending, (s, a) => {
        const { id, isFavorite } = a.meta.arg;
        if (isFavorite) {
          const favoriteToRollback = s.favoriteItems.find((notice) => notice._id === id);
          if (favoriteToRollback) s.favoriteRollbackCache[id] = favoriteToRollback;
          s.favoriteIds = s.favoriteIds.filter((fid) => fid !== id);
          s.favoriteItems = s.favoriteItems.filter((notice) => notice._id !== id);
        } else if (!s.favoriteIds.includes(id)) {
          s.favoriteIds = [...s.favoriteIds, id];
          const notice = s.items.find((item) => item._id === id);
          if (notice && !s.favoriteItems.some((favorite) => favorite._id === id)) {
            s.favoriteItems = [notice, ...s.favoriteItems];
          }
        }
      })
      // Fulfilled: sync with the authoritative ID list returned by the API
      .addCase(toggleFavorite.fulfilled, (s, a) => {
        s.favoriteIds = a.payload.favoriteIds;
        s.favoriteItems = s.favoriteItems.filter((notice) => s.favoriteIds.includes(notice._id));
        delete s.favoriteRollbackCache[a.payload.id];
      })
      // Rejected: rollback the optimistic update and surface the error
      .addCase(toggleFavorite.rejected, (s, a) => {
        const { id, isFavorite } = a.meta.arg;
        if (isFavorite) {
          // Tried to remove but failed → re-add
          if (!s.favoriteIds.includes(id)) s.favoriteIds = [...s.favoriteIds, id];
          const rollbackNotice = s.favoriteRollbackCache[id] ?? s.items.find((notice) => notice._id === id);
          if (rollbackNotice && !s.favoriteItems.some((favorite) => favorite._id === id)) {
            s.favoriteItems = [rollbackNotice, ...s.favoriteItems];
          }
        } else {
          // Tried to add but failed → remove
          s.favoriteIds = s.favoriteIds.filter((fid) => fid !== id);
          s.favoriteItems = s.favoriteItems.filter((notice) => notice._id !== id);
        }
        delete s.favoriteRollbackCache[id];
        s.error = a.payload as string;
      });
  },
});

export const { setFilters, resetFilters, clearNoticesError } = noticesSlice.actions;
export default noticesSlice.reducer;
