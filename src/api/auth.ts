import { instance } from './axiosInstance';
import type { LoginCredentials, RegisterCredentials, User } from '../types';

export const registerApi = (data: RegisterCredentials) =>
  instance.post<User>('/users/signup', data);

export const loginApi = (data: LoginCredentials) =>
  instance.post<User>('/users/signin', data);

export const logoutApi = () =>
  instance.post('/users/signout');

export const getCurrentUserApi = () =>
  instance.get<User>('/users/current/full');

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export const updateUserApi = (data: UpdateUserPayload) =>
  instance.patch<User>('/users/current/edit', data);
