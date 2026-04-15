import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { login, logout, refreshUser, register, updateUserProfile } from './authSlice';
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
    const seedFromAuthPayload = (state: ViewedNoticesState, payload: unknown): void => {
      if (!payload || typeof payload !== 'object') return;
      const userPayload = payload as Record<string, unknown>;
      const userKey = typeof userPayload._id === 'string'
        ? userPayload._id
        : typeof userPayload.email === 'string'
          ? userPayload.email
          : '';
      if (!userKey) return;
      const viewedSource = userPayload.noticesViewed;
      if (!Array.isArray(viewedSource)) return;
      const notices = viewedSource
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const candidate = item as Record<string, unknown>;
          const id = typeof candidate._id === 'string'
            ? candidate._id
            : typeof candidate.id === 'string'
              ? candidate.id
              : '';
          if (!id) return null;
          return {
            ...(candidate as unknown as Pet),
            _id: id,
          };
        })
        .filter((item): item is Pet => Boolean(item));

      state.viewedByUser[userKey] = notices.map((notice) => notice._id);
      state.noticeCacheByUser[userKey] = notices.reduce<Record<string, Pet>>((acc, notice) => {
        acc[notice._id] = notice;
        return acc;
      }, {});
      persistViewedState(state);
    };

    builder
      .addCase(refreshUser.fulfilled, (state, action) => seedFromAuthPayload(state, action.payload))
      .addCase(login.fulfilled, (state, action) => seedFromAuthPayload(state, action.payload))
      .addCase(register.fulfilled, (state, action) => seedFromAuthPayload(state, action.payload))
      .addCase(updateUserProfile.fulfilled, (state, action) => seedFromAuthPayload(state, action.payload));

    builder.addCase(logout.fulfilled, (state) => {
      state.viewedByUser = {};
      state.noticeCacheByUser = {};
      persistViewedState(state);
    });
  },
});

export const { markNoticeViewed } = viewedNoticesSlice.actions;
export default viewedNoticesSlice.reducer;
