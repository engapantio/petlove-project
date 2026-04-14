import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice';
import type { Pet, ViewedNoticesState } from '../../types';

const VIEWED_STORAGE_KEY = 'petloveViewedNoticesByUser';

const getPersistedViewedState = (): ViewedNoticesState => {
  try {
    const raw = localStorage.getItem(VIEWED_STORAGE_KEY);
    if (!raw) {
      return {
        viewedByUser: {},
        noticeCacheByUser: {},
      };
    }
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed
      || typeof parsed !== 'object'
      || !('viewedByUser' in parsed)
      || !('noticeCacheByUser' in parsed)
    ) {
      return {
        viewedByUser: {},
        noticeCacheByUser: {},
      };
    }

    const candidate = parsed as ViewedNoticesState;
    return {
      viewedByUser: candidate.viewedByUser ?? {},
      noticeCacheByUser: candidate.noticeCacheByUser ?? {},
    };
  } catch {
    return {
      viewedByUser: {},
      noticeCacheByUser: {},
    };
  }
};

const persistViewedState = (state: ViewedNoticesState): void => {
  try {
    localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore localStorage failures.
  }
};

interface MarkViewedPayload {
  userKey: string;
  noticeId: string;
  notice?: Pet;
}

const initialState: ViewedNoticesState = getPersistedViewedState();

const viewedNoticesSlice = createSlice({
  name: 'viewedNotices',
  initialState,
  reducers: {
    markNoticeViewed(state, action: PayloadAction<MarkViewedPayload>) {
      const { userKey, noticeId, notice } = action.payload;
      const userViewed = state.viewedByUser[userKey] ?? [];
      if (!userViewed.includes(noticeId)) {
        state.viewedByUser[userKey] = [noticeId, ...userViewed];
      }
      if (notice) {
        state.noticeCacheByUser[userKey] = {
          ...(state.noticeCacheByUser[userKey] ?? {}),
          [noticeId]: notice,
        };
      }
      persistViewedState(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      state.viewedByUser = {};
      state.noticeCacheByUser = {};
      persistViewedState(state);
    });
  },
});

export const { markNoticeViewed } = viewedNoticesSlice.actions;
export default viewedNoticesSlice.reducer;
