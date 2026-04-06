import {
  createSlice,
  createAsyncThunk,
 type PayloadAction,
} from '@reduxjs/toolkit';
import {
  instance,
  setAuthHeader,
  clearAuthHeader,
} from '../../api/axiosInstance';
import type { RootState } from '../store';

// ── Domain types ──────────────────────────────────────────────────────────────
export interface User {
  _id:    string;
  name:   string;
  email:  string;
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  user:         User | null;
  token:        string | null;
  isLoggedIn:   boolean;
  isRefreshing: boolean;
  isLoading:    boolean;
  error:        string | null;
}

export interface RegisterCredentials {
  name:     string;
  email:    string;
  password: string;
}

export interface LoginCredentials {
  email:    string;
  password: string;
}

interface AuthApiResponse {
  user:  User;
  token: string;
}

// ── Initial state ─────────────────────────────────────────────────────────────
const initialState: AuthState = {
  user:         null,
  token:        null,
  isLoggedIn:   false,
  isRefreshing: false,
  isLoading:    false,
  error:        null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

/** POST /users/register */
export const register = createAsyncThunk<
  AuthApiResponse,
  RegisterCredentials,
  { rejectValue: string }
>(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await instance.post<AuthApiResponse>(
        '/users/register',
        credentials,
      );
      setAuthHeader(data.token);
      return data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

/** POST /users/login */
export const login = createAsyncThunk<
  AuthApiResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await instance.post<AuthApiResponse>(
        '/users/login',
        credentials,
      );
      setAuthHeader(data.token);
      return data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

/** POST /users/logout — always clears local state regardless of server response */
export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await instance.post('/users/logout');
    } catch (err: unknown) {
      // Fire-and-forget: still clear client state on network failure
      return rejectWithValue((err as Error).message);
    } finally {
      clearAuthHeader();
    }
  },
);

/** GET /users/current — dispatched once on app mount to restore session.
 *  Reads token persisted in Redux (from localStorage via store subscriber). */
export const refreshUser = createAsyncThunk<
  User,
  void,
  { state: RootState; rejectValue: string }
>(
  'auth/refreshUser',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    if (!token) return rejectWithValue('No token present');

    setAuthHeader(token);          // reattach before the request
    try {
      const { data } = await instance.get<User>('/users/current');
      return data;
    } catch (err: unknown) {
      clearAuthHeader();
      return rejectWithValue((err as Error).message);
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Manually inject credentials (e.g., after OAuth callback). */
    setCredentials(
      state,
      { payload }: PayloadAction<{ user: User; token: string }>,
    ) {
      state.user      = payload.user;
      state.token     = payload.token;
      state.isLoggedIn = true;
      state.error     = null;
      setAuthHeader(payload.token);
    },

    /** Hard-reset without making a server call (e.g., 401 interceptor). */
    clearCredentials(state) {
      state.user       = null;
      state.token      = null;
      state.isLoggedIn = false;
      state.error      = null;
      clearAuthHeader();
    },
  },

  extraReducers: (builder) => {
    // ── register ─────────────────────────────────────────────────────────────
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.user       = payload.user;
        state.token      = payload.token;
        state.isLoggedIn = true;
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload ?? 'Registration failed';
      });

    // ── login ─────────────────────────────────────────────────────────────────
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.user       = payload.user;
        state.token      = payload.token;
        state.isLoggedIn = true;
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error     = payload ?? 'Login failed';
      });

    // ── logout ────────────────────────────────────────────────────────────────
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading  = false;
        state.user       = null;
        state.token      = null;
        state.isLoggedIn = false;
        state.error      = null;
      })
      .addCase(logout.rejected, (state) => {
        // Server rejected, but we still clear everything locally (finally block ran)
        state.isLoading  = false;
        state.user       = null;
        state.token      = null;
        state.isLoggedIn = false;
      });

    // ── refreshUser ───────────────────────────────────────────────────────────
    builder
      .addCase(refreshUser.pending, (state) => {
        state.isRefreshing = true;
        state.error        = null;
      })
      .addCase(refreshUser.fulfilled, (state, { payload }) => {
        state.isRefreshing = false;
        state.user         = payload;
        state.isLoggedIn   = true;
      })
      .addCase(refreshUser.rejected, (state) => {
        // Invalid / expired token → clear silently
        state.isRefreshing = false;
        state.token        = null;
        state.isLoggedIn   = false;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectUser        = (state: RootState) => state.auth.user;
export const selectToken       = (state: RootState) => state.auth.token;
export const selectIsLoggedIn  = (state: RootState) => state.auth.isLoggedIn;
export const selectIsRefreshing = (state: RootState) => state.auth.isRefreshing;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError   = (state: RootState) => state.auth.error;
