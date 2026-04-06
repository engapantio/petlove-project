import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { instance } from '../../api/axiosInstance';
import type { NoticesState, NoticesFilters, PaginatedResponse, Pet } from '../../types';

const initialState: NoticesState = {
  items: [], favorites: [], owned: [],
  totalPages: 1, currentPage: 1,
  isLoading: false, error: null,
  filters: { search: '', category: '', gender: '', type: '', location: '', page: 1 },
};

export const fetchNotices = createAsyncThunk(
  'notices/fetchAll',
  async (filters: Partial<NoticesFilters>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
      const { data } = await instance.get<PaginatedResponse<Pet>>(`/notices?${params}`);
      return data;
    } catch (err: unknown) { return rejectWithValue((err as Error).message); }
  },
);

export const fetchFavorites = createAsyncThunk('notices/favorites', async (_, { rejectWithValue }) => {
  try {
    const { data } = await instance.get<PaginatedResponse<Pet>>('/notices/favorites');
    return data;
  } catch (err: unknown) { return rejectWithValue((err as Error).message); }
});

export const toggleFavorite = createAsyncThunk(
  'notices/toggleFavorite',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await instance.post<{ result: Pet[] }>(`/notices/favorites/${id}`);
      return data.result;
    } catch (err: unknown) { return rejectWithValue((err as Error).message); }
  },
);

const noticesSlice = createSlice({
  name: 'notices',
  initialState,
  reducers: {
    setFilters(s, a: PayloadAction<Partial<NoticesFilters>>) { s.filters = { ...s.filters, ...a.payload }; },
    resetFilters(s) { s.filters = initialState.filters; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotices.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchNotices.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload.results; s.totalPages = a.payload.totalPages; s.currentPage = a.payload.page; })
      .addCase(fetchNotices.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    builder.addCase(fetchFavorites.fulfilled, (s, a) => { s.favorites = a.payload.results; });
    builder.addCase(toggleFavorite.fulfilled, (s, a) => { s.favorites = a.payload; });
  },
});

export const { setFilters, resetFilters } = noticesSlice.actions;
export default noticesSlice.reducer;
