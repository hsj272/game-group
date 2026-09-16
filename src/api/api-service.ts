import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { showToast } from 'vant';
import { getRacingUserId } from '@/api/auth';
import type { Result } from '@/views/api/protocol';

export class RacingApiError extends Error {
  constructor(public readonly code: number, message: string) {
    super(message);
    this.name = 'RacingApiError';
  }
}

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_SERVER_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
});

service.interceptors.request.use((config) => {
  const userId = getRacingUserId();
  if (userId) config.headers['X-User-Id'] = String(userId);
  return config;
});

service.interceptors.response.use(
  ((response: AxiosResponse<Result>) => {
    const result = response.data;
    if (result.code === 200) return result.data;
    throw new RacingApiError(result.code, result.msg || 'Request failed');
  }) as any,
  (error) => {
    const message = error.response?.data?.msg || error.message || 'Network error';
    showToast(message);
    return Promise.reject(error);
  },
);

export async function get<R, T extends object = Record<string, never>>(url: string, params?: T) {
  return (await service.get(url, { params })) as unknown as R;
}

export async function post<R, T extends object = Record<string, never>>(url: string, body?: T) {
  return (await service.post(url, body)) as unknown as R;
}
