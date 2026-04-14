import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instance } from '../../api/axiosInstance';
import type { ProfileState, MyPet, AddPetPayload } from '../../types';
import type { RootState } from '..';

const initialState: ProfileState = {
  pets: [],
  isLoading: false,
  error: null,
  hasLoaded: false,
};

export const fetchMyPets = createAsyncThunk('profile/fetchPets', async (_, { rejectWithValue }) => {
  try {
    const { data } = await instance.get<MyPet[]>('/users/current/pets');
    return data;
  } catch (err: unknown) { return rejectWithValue((err as Error).message); }
});

export const deleteMyPet = createAsyncThunk('profile/deletePet', async (id: string, { rejectWithValue }) => {
  try {
    await instance.delete(`/users/current/pets/remove/${id}`);
    return id;
  } catch (err: unknown) { return rejectWithValue((err as Error).message); }
});

export const addMyPet = createAsyncThunk(
  'profile/addPet',
  async (payload: AddPetPayload, { rejectWithValue }) => {
    try {
      const { data } = await instance.post<{ pets: MyPet[] }>('/users/current/pets/add', payload);
      return data.pets;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  },
);

const profileSlice = createSlice({
  name: 'profile', initialState, reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPets.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchMyPets.fulfilled, (s, a) => {
        s.isLoading = false;
        s.hasLoaded = true;
        s.pets = a.payload;
      })
      .addCase(fetchMyPets.rejected, (s, a) => {
        s.isLoading = false;
        s.hasLoaded = true;
        s.error = a.payload as string;
      });
    builder.addCase(deleteMyPet.fulfilled, (s, a) => { s.pets = s.pets.filter((p) => p._id !== a.payload); });
    builder
      .addCase(addMyPet.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(addMyPet.fulfilled, (s, a) => {
        s.isLoading = false;
        s.hasLoaded = true;
        s.pets = a.payload;
      })
      .addCase(addMyPet.rejected, (s, a) => {
        s.isLoading = false;
        s.hasLoaded = true;
        s.error = a.payload as string;
      });
  },
});

export default profileSlice.reducer;

export const selectMyPets = (state: RootState): MyPet[] => state.profile.pets;
export const selectProfileLoading = (state: RootState): boolean => state.profile.isLoading;
export const selectProfileHasLoaded = (state: RootState): boolean => state.profile.hasLoaded;
