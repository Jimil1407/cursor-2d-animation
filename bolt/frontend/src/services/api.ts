import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuth } from 'firebase/auth';
import {
  CodeResponse,
  GenerationResponse,
  HistoryItem,
  UpdateCodeResponse,
  UsageStats,
} from '../types';

export const API_URL = (
  import.meta.env.VITE_API_URL ?? 'https://promptmotion-backend-v1.onrender.com'
).replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 300_000, // A cold render can legitimately take minutes.
});

api.interceptors.request.use(async (config) => {
  const user = getAuth().currentUser;
  if (user) {
    config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }
  return config;
});

// Firebase ID tokens expire after an hour. Rather than failing the request,
// force a refresh once and replay it.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const user = getAuth().currentUser;

    if (error.response?.status === 401 && request && !request._retried && user) {
      request._retried = true;
      request.headers.Authorization = `Bearer ${await user.getIdToken(true)}`;
      return api(request);
    }

    return Promise.reject(error);
  }
);

export const generateAnimation = async (prompt: string): Promise<GenerationResponse> =>
  (await api.post<GenerationResponse>('/generate', { prompt })).data;

export const getCode = async (sceneFileId: string): Promise<string> =>
  (await api.get<CodeResponse>(`/code/${sceneFileId}`)).data.code;

export const updateCode = async (sceneFileId: string, code: string): Promise<UpdateCodeResponse> =>
  (await api.put<UpdateCodeResponse>(`/code/${sceneFileId}`, { code })).data;

export const fetchMyCodes = async (): Promise<HistoryItem[]> => {
  const response = await api.get<{ codes: HistoryItem[] }>('/my-codes');
  return response.data.codes ?? [];
};

export const fetchUsageStats = async (): Promise<UsageStats> =>
  (await api.get<UsageStats>('/usage-stats')).data;

export const getVideoUrl = (videoPath: string): string => {
  if (!videoPath) return '';
  return videoPath.startsWith('http') ? videoPath : `${API_URL}${videoPath}`;
};

// The backend derives the account from the verified ID token, so no uid is sent.
export const createRazorpayOrder = async (plan: string) =>
  (await api.post('/api/create-razorpay-order', { plan })).data;

export const cancelSubscription = async () => (await api.post('/api/cancel-subscription')).data;

export default api;
