import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAppDispatch, useAppSelector } from './hooks/redux';
import { refreshUser } from './store/slices/authSlice';
import { fetchFriends } from './store/slices/friendsSlice';
import { fetchNews } from './store/slices/newsSlice';
import { fetchNotices, fetchNoticesOptions } from './store/slices/noticesSlice';
import type { RootState } from './store';
import {
  skipDefaultNewsPrefetchFromLocation,
  skipDefaultNoticesPrefetchFromLocation,
} from './utils/idlePrefetchGuards';
import PrivateRoute from './routes/PrivateRoute';
import RestrictedRoute from './routes/RestrictedRoute';
import Layout from './components/layout/Layout';
import { RouteLoaderFallback } from './components/Loader';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const HomePage     = lazy(() => import('./pages/HomePage'));
const MainPage     = lazy(() => import('./pages/MainPage'));
const NewsPage     = lazy(() => import('./pages/NewsPage'));
const NoticesPage  = lazy(() => import('./pages/NoticesPage'));
const FriendsPage  = lazy(() => import('./pages/FriendsPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage    = lazy(() => import('./pages/LoginPage'));
const ProfilePage  = lazy(() => import('./pages/ProfilePage'));
const AddPetPage   = lazy(() => import('./pages/AddPetPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => {
  const dispatch = useAppDispatch();
  const store = useStore();
  const isAuthInitialized = useAppSelector((state) => state.auth.isAuthInitialized);
  const isFavoritesInitialized = useAppSelector((state) => state.notices.isFavoritesInitialized);
  const [isBootReady, setIsBootReady] = useState(false);

  /** On every cold start, try to restore the session using the
   *  stored token. authSlice reads token from Redux (persisted
   *  via redux-persist or equivalent) and calls GET /users/current. */
  useEffect(() => {
    let isMounted = true;
    const BOOT_FALLBACK_MS = 5_000;

    const bootstrap = async (): Promise<void> => {
      await Promise.race([
        dispatch(refreshUser()),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, BOOT_FALLBACK_MS);
        }),
      ]);
      if (isMounted) setIsBootReady(true);
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  /** Warm default lists + notices filters in idle time (SPA — no SSR). Guards avoid stomping URL-driven queries. */
  useEffect(() => {
    if (!isAuthInitialized || !isBootReady || !isFavoritesInitialized) return;

    const run = (): void => {
      const state = store.getState() as RootState;
      void dispatch(fetchFriends());

      if (
        state.news.items.length === 0 &&
        !state.news.isLoading &&
        !skipDefaultNewsPrefetchFromLocation()
      ) {
        void dispatch(fetchNews({ page: 1, keyword: '', limit: 6 }));
      }

      if (
        state.notices.items.length === 0 &&
        !state.notices.isLoading &&
        !skipDefaultNoticesPrefetchFromLocation()
      ) {
        void dispatch(fetchNotices({ page: 1, limit: 6 }));
      }

      void dispatch(fetchNoticesOptions());
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(run, { timeout: 4000 });
    } else {
      timeoutId = window.setTimeout(run, 400);
    }

    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [dispatch, store, isAuthInitialized, isBootReady, isFavoritesInitialized]);

  if (!isAuthInitialized || !isBootReady || !isFavoritesInitialized) {
    return <RouteLoaderFallback />;
  }

  return (
    <>
      <Suspense fallback={<RouteLoaderFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public */}
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="main"    element={<MainPage />} />
            <Route path="home"    element={<HomePage />} />
            <Route path="news"    element={<NewsPage />} />
            <Route path="notices" element={<NoticesPage />} />
            <Route path="friends" element={<FriendsPage />} />

            {/* Restricted — only for guests */}
            <Route
              path="register"
              element={<RestrictedRoute component={<RegisterPage />} />}
            />
            <Route
              path="login"
              element={<RestrictedRoute component={<LoginPage />} />}
            />

            {/* Private — only for authenticated users */}
            <Route
              path="profile"
              element={<PrivateRoute component={<ProfilePage />} />}
            />
            <Route
              path="add-pet"
              element={<PrivateRoute component={<AddPetPage />} />}
            />

            <Route path="404" element={<NotFoundPage />} />
            {/* Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default App;
