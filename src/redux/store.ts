import { configureStore, type Middleware } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';

// ── Slice imports (add as you create them) ────────────────────────────────────
// import noticesReducer from './notices/noticesSlice';
// import newsReducer    from './news/newsSlice';
// import petsReducer    from './pets/petsSlice';

// ── localStorage persistence ──────────────────────────────────────────────────
const TOKEN_KEY = 'petlove_token';

const loadToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const saveToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* storage quota / private-mode — fail silently */
  }
};

// ── Preloaded state ───────────────────────────────────────────────────────────
const preloadedToken = loadToken();

// ── Token-sync middleware ─────────────────────────────────────────────────────
// Runs after every action; persists token whenever the auth slice changes it.
const tokenPersistMiddleware: Middleware = (api) => (next) => (action) => {
  const result = next(action);
  const { auth } = api.getState() as RootState;
  saveToken(auth.token);
  return result;
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // notices: noticesReducer,
    // news:    newsReducer,
    // pets:    petsReducer,
  },
  preloadedState: {
    auth: {
      user:         null,
      token:        preloadedToken,   // rehydrate token from localStorage
      isLoggedIn:   false,            // confirmed by refreshUser on mount
      isRefreshing: false,
      isLoading:    false,
      error:        null,
    },
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // FormData (add-pet form) is not serializable — ignore those action paths
        ignoredActions: ['pets/addPet/pending', 'pets/addPet/fulfilled'],
      },
    }).concat(tokenPersistMiddleware),
});

// ── Types ─────────────────────────────────────────────────────────────────────
export type RootState    = ReturnType<typeof store.getState>;
export type AppDispatch  = typeof store.dispatch;
