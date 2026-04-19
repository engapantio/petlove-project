import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setAuthHeader, clearAuthHeader } from '../../api/axiosInstance';
import {
  loginApi,
  registerApi,
  logoutApi,
  getCurrentUserApi,
  updateUserApi,
  type UpdateUserPayload,
} from '../../api/auth';
import type { AuthState, LoginCredentials, RegisterCredentials } from '../../types';
import {
  mapApiErrorMessage,
  mapEmailAlreadyRegisteredMessage,
} from '../../utils/mapApiErrorMessage';

const rejectMessage = (a: { payload: unknown }): string => {
  if (typeof a.payload === 'string' && a.payload.trim()) return a.payload;
  return mapApiErrorMessage(null);
};

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
      const signup = await registerApi(credentials);
      if (!signup?.data) {
        return rejectWithValue(mapApiErrorMessage(null));
      }
      const regData = signup.data;
      if (typeof regData.token !== 'string' || !regData.token.trim()) {
        return rejectWithValue(mapApiErrorMessage(null));
      }
      setAuthHeader(regData.token);
      const profile = await getCurrentUserApi();
      if (!profile?.data) {
        clearAuthHeader();
        return rejectWithValue(mapApiErrorMessage(null));
      }
      return {
        ...profile.data,
        token: regData.token,
      };
    } catch (err: unknown) {
      const raw = mapApiErrorMessage(err);
      return rejectWithValue(mapEmailAlreadyRegisteredMessage(raw));
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const res = await loginApi(credentials);
      if (!res?.data) {
        return rejectWithValue(mapApiErrorMessage(null));
      }
      const { data } = res;
      if (typeof data.token !== 'string' || !data.token.trim()) {
        return rejectWithValue(mapApiErrorMessage(null));
      }
      setAuthHeader(data.token);
      const profile = await getCurrentUserApi();
      if (!profile?.data) {
        clearAuthHeader();
        return rejectWithValue(mapApiErrorMessage(null));
      }
      return {
        ...profile.data,
        token: data.token,
      };
    } catch (err: unknown) {
      return rejectWithValue(mapApiErrorMessage(err));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutApi();
  } catch (err: unknown) {
    return rejectWithValue(mapApiErrorMessage(err));
  } finally {
    clearAuthHeader();
  }
});

export const refreshUser = createAsyncThunk(
  'auth/refreshUser',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState };
    if (!auth.token) return rejectWithValue('No token');
    setAuthHeader(auth.token);
    try {
      const res = await getCurrentUserApi();
      if (!res?.data) {
        clearAuthHeader();
        return rejectWithValue(mapApiErrorMessage(null));
      }
      return {
        ...res.data,
        token: auth.token,
      };
    } catch (err: unknown) {
      return rejectWithValue(mapApiErrorMessage(err));
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (payload: UpdateUserPayload, { rejectWithValue }) => {
    try {
      const patchRes = await updateUserApi(payload);
      if (!patchRes?.data) {
        return rejectWithValue(mapApiErrorMessage(null));
      }
      const { data } = patchRes;
      if (data.token) setAuthHeader(data.token);
      const profile = await getCurrentUserApi();
      if (!profile?.data) {
        return rejectWithValue(mapApiErrorMessage(null));
      }
      return {
        ...profile.data,
        token: data.token ?? profile.data.token,
      };
    } catch (err: unknown) {
      return rejectWithValue(mapApiErrorMessage(err));
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
        if (!a.payload) {
          s.error = mapApiErrorMessage(null);
          return;
        }
        s.user = a.payload;
        s.token = a.payload.token;
        s.isLoggedIn = true;
        s.isAuthInitialized = true;
        persistToken(a.payload.token);
      })
      .addCase(register.rejected, (s, a) => { s.isLoading = false; s.error = rejectMessage(a); });
    builder
      .addCase(login.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.isLoading = false;
        if (!a.payload) {
          s.error = mapApiErrorMessage(null);
          return;
        }
        s.user = a.payload;
        s.token = a.payload.token;
        s.isLoggedIn = true;
        s.isAuthInitialized = true;
        persistToken(a.payload.token);
      })
      .addCase(login.rejected, (s, a) => { s.isLoading = false; s.error = rejectMessage(a); });
    builder.addCase(logout.fulfilled, (s) => {
      s.user = null;
      s.token = null;
      s.isLoggedIn = false;
      s.isAuthInitialized = true;
      clearPersistedToken();
    });
    builder.addCase(logout.rejected, (s, a) => {
      s.isLoading = false;
      s.error = rejectMessage(a);
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
        if (!a.payload) {
          s.isLoggedIn = false;
          s.user = null;
          s.token = null;
          s.isAuthInitialized = true;
          clearPersistedToken();
          clearAuthHeader();
          return;
        }
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
    builder
      .addCase(updateUserProfile.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (s, a) => {
        s.isLoading = false;
        if (!a.payload) return;
        if (!s.user) {
          s.user = {
            ...a.payload,
            token: a.payload.token ?? s.token ?? '',
          };
          return;
        }

        s.user = {
          ...s.user,
          ...a.payload,
          token: s.user.token,
        };
      })
      .addCase(updateUserProfile.rejected, (s, a) => {
        s.isLoading = false;
        s.error = rejectMessage(a);
      });
  },
});

export default authSlice.reducer;
