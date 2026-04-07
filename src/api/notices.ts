import { instance } from './axiosInstance';
import type { NoticeDetails } from '../types';

export const getNoticeByIdApi = (id: string) =>
  instance.get<NoticeDetails>(`/notices/${id}`);

