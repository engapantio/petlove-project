import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { instance } from '../../api/axiosInstance';
import type { ProfileState, MyPet, AddPetPayload } from '../../types';
import type { RootState } from '..';
import { login, refreshUser, register, updateUserProfile } from './authSlice';

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
    const seedPetsFromAuthPayload = (s: ProfileState, payload: unknown): void => {
      if (!payload || typeof payload !== 'object') return;
      const candidate = payload as Record<string, unknown>;
      const rawPets = candidate.pets;
      if (!Array.isArray(rawPets)) return;
      const nextPets = rawPets
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const pet = item as Record<string, unknown>;
          const id = typeof pet._id === 'string' ? pet._id : '';
          if (!id) return null;
          return {
            ...(pet as unknown as MyPet),
            _id: id,
          };
        })
        .filter((item): item is MyPet => Boolean(item));

      // Avoid clobbering local state with identical stale data.
      const currentIds = s.pets.map((pet) => pet._id).join('|');
      const nextIds = nextPets.map((pet) => pet._id).join('|');
      if (!s.hasLoaded || currentIds !== nextIds || nextPets.length >= s.pets.length) {
        s.pets = nextPets;
        s.hasLoaded = true;
      }
    };

    builder
      .addCase(refreshUser.fulfilled, (s, a) => seedPetsFromAuthPayload(s, a.payload))
      .addCase(login.fulfilled, (s, a) => seedPetsFromAuthPayload(s, a.payload))
      .addCase(register.fulfilled, (s, a) => seedPetsFromAuthPayload(s, a.payload))
      .addCase(updateUserProfile.fulfilled, (s, a) => seedPetsFromAuthPayload(s, a.payload));

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
