import { instance } from './axiosInstance';
import type { LoginCredentials, RegisterCredentials, User } from '../types';

export const registerApi = (data: RegisterCredentials) =>
  instance.post<User>('/users/signup', data);

export const loginApi = (data: LoginCredentials) =>
  instance.post<User>('/users/signin', data);

export const logoutApi = () =>
  instance.post('/users/signout');

export const getCurrentUserApi = () =>
  instance.get<User>('/users/current');

export const updateUserApi = (data: FormData) =>
  instance.patch<User>('/users/current/edit', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
