import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setAuthHeader, clearAuthHeader } from '../../api/axiosInstance';
import { loginApi, registerApi, logoutApi, getCurrentUserApi } from '../../api/auth';
import type { AuthState, LoginCredentials, RegisterCredentials } from '../../types';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
  isRefreshing: false,
  isLoading: false,
  error: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const { data } = await registerApi(credentials);
      setAuthHeader(data.token);
      return data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { data } = await loginApi(credentials);
      setAuthHeader(data.token);
      return data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutApi();
    clearAuthHeader();
  } catch (err: unknown) {
    return rejectWithValue((err as Error).message);
  }
});

export const refreshUser = createAsyncThunk(
  'auth/refreshUser',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState };
    if (!auth.token) return rejectWithValue('No token');
    setAuthHeader(auth.token);
    try {
      const { data } = await getCurrentUserApi();
      return data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(register.fulfilled, (s, a) => { s.isLoading = false; s.user = a.payload; s.token = a.payload.token; s.isLoggedIn = true; })
      .addCase(register.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    builder
      .addCase(login.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.isLoading = false; s.user = a.payload; s.token = a.payload.token; s.isLoggedIn = true; })
      .addCase(login.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    builder.addCase(logout.fulfilled, (s) => { s.user = null; s.token = null; s.isLoggedIn = false; });
    builder
      .addCase(refreshUser.pending, (s) => { s.isRefreshing = true; })
      .addCase(refreshUser.fulfilled, (s, a) => { s.isRefreshing = false; s.user = a.payload; s.isLoggedIn = true; })
      .addCase(refreshUser.rejected, (s) => { s.isRefreshing = false; });
  },
});

export default authSlice.reducer;
