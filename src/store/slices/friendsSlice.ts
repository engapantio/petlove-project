import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instance } from '../../api/axiosInstance';
import type { FriendsState, Friend } from '../../types';
import type { RootState } from '..';
import { mapApiErrorMessage } from '../../utils/mapApiErrorMessage';

const initialState: FriendsState = { items: [], isLoading: false, error: null };

export const fetchFriends = createAsyncThunk(
  'friends/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await instance.get<Friend[]>('/friends');
      return data;
    } catch (err: unknown) {
      return rejectWithValue(mapApiErrorMessage(err));
    }
  },
  {
    condition: (_, { getState }) => !(getState() as RootState).friends.isLoading,
  },
);

const friendsSlice = createSlice({
  name: 'friends', initialState, reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (s) => {
        s.isLoading = true;
        s.error = null;
      })
      .addCase(fetchFriends.fulfilled, (s, a) => { s.isLoading = false; s.items = a.payload; })
      .addCase(fetchFriends.rejected, (s, a) => { s.isLoading = false; s.error = a.payload as string; });
  },
});

export default friendsSlice.reducer;
