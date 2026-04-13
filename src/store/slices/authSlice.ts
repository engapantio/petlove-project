import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setAuthHeader, clearAuthHeader } from '../../api/axiosInstance';
import { loginApi, registerApi, logoutApi, getCurrentUserApi } from '../../api/auth';
import type { AuthState, LoginCredentials, RegisterCredentials } from '../../types';

const AUTH_TOKEN_KEY = 'petloveToken';

const getPersistedToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

const persistToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // Ignore persistence errors (private mode, storage quota).
  }
};

const clearPersistedToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Ignore persistence errors.
  }
};

const initialState: AuthState = {
  user: null,
  token: getPersistedToken(),
  isLoggedIn: false,
  isRefreshing: false,
  isAuthInitialized: false,
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
      .addCase(register.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload;
        s.token = a.payload.token;
        s.isLoggedIn = true;
        s.isAuthInitialized = true;
        persistToken(a.payload.token);
      })
      .addCase(register.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    builder
      .addCase(login.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.isLoading = false;
        s.user = a.payload;
        s.token = a.payload.token;
        s.isLoggedIn = true;
        s.isAuthInitialized = true;
        persistToken(a.payload.token);
      })
      .addCase(login.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
    builder.addCase(logout.fulfilled, (s) => {
      s.user = null;
      s.token = null;
      s.isLoggedIn = false;
      s.isAuthInitialized = true;
      clearPersistedToken();
    });
    builder
      .addCase(refreshUser.pending, (s) => { s.isRefreshing = true; })
      .addCase(refreshUser.fulfilled, (s, a) => {
        s.isRefreshing = false;
        s.user = a.payload;
        s.token = a.payload.token ?? s.token;
        s.isLoggedIn = true;
        s.isAuthInitialized = true;
        if (s.token) persistToken(s.token);
      })
      .addCase(refreshUser.rejected, (s) => {
        s.isRefreshing = false;
        s.isLoggedIn = false;
        s.user = null;
        s.token = null;
        s.isAuthInitialized = true;
        clearPersistedToken();
        clearAuthHeader();
      });
  },
});

export default authSlice.reducer;
