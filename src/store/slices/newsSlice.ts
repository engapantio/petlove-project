import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instance } from '../../api/axiosInstance';
import type { NewsState, PaginatedResponse, NewsItem } from '../../types';

const initialState: NewsState = { items: [], totalPages: 1, currentPage: 1, search: '', isLoading: false, error: null };

export const fetchNews = createAsyncThunk(
  'news/fetchAll',
  async (
    { page = 1, keyword = '', limit }: { page?: number; keyword?: string; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (keyword) params.set('keyword', keyword);
      if (limit) params.set('limit', String(limit));

      const { data } = await instance.get<PaginatedResponse<NewsItem>>(`/news?${params}`);
      return data;
    } catch (err: unknown) { return rejectWithValue((err as Error).message); }
  },
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: { setSearch(s, a) { s.search = a.payload; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchNews.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload.results; s.totalPages = a.payload.totalPages; s.currentPage = a.payload.page; })
      .addCase(fetchNews.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export const { setSearch } = newsSlice.actions;
export default newsSlice.reducer;
