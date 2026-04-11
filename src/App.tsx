import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAppDispatch } from './hooks/redux';
import { refreshUser } from './store/slices/authSlice';
import PrivateRoute from './routes/PrivateRoute';
import RestrictedRoute from './routes/RestrictedRoute';
import Layout from './components/layout/Layout';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const HomePage     = lazy(() => import('./pages/HomePage'));
const NewsPage     = lazy(() => import('./pages/NewsPage/NewsPage'));
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

  /** On every cold start, try to restore the session using the
   *  stored token. authSlice reads token from Redux (persisted
   *  via redux-persist or equivalent) and calls GET /users/current. */
  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

  return (
    <>
      <Suspense
        fallback={
          <div className="appRouteLoading appRouteLoading--main" aria-busy="true" role="status">
            Loading…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public */}
            <Route index element={<Navigate to="/home" replace />} />
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
