import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import noticesReducer from './slices/noticesSlice';
import newsReducer from './slices/newsSlice';
import friendsReducer from './slices/friendsSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notices: noticesReducer,
    news: newsReducer,
    friends: friendsReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,      // allow FormData in thunk args
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
