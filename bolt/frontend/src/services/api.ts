import axios from 'axios';
import { GenerationResponse, CodeResponse } from '../types';
import { auth } from './firebase';

const API_BASE_URL = 'https://promptmotion-backend-v1.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include Firebase ID token in every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    if (config.headers && typeof config.headers === 'object') {
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  }
  console.log('API Request:', config.method, config.url, config.headers);
  return config;
});

export const generateAnimation = async (prompt: string): Promise<GenerationResponse> => {
  try {
    const response = await api.post<GenerationResponse>('/generate', { prompt });
    return response.data;
  } catch (error) {
    console.error('Error generating animation:', error);
    throw error;
  }
};

export const getCode = async (sceneFileId: string): Promise<string> => {
  try {
    const response = await api.get<CodeResponse>(`/code/${sceneFileId}`);
    return response.data.code;
  } catch (error) {
    console.error('Error fetching code:', error);
    throw error;
  }
};

export const updateCode = async (sceneFileId: string, code: string): Promise<void> => {
  try {
    await api.put(`/code/${sceneFileId}`, { code });
  } catch (error) {
    console.error('Error updating code:', error);
    throw error;
  }
};

export const getVideoUrl = (videoPath: string): string => {
  if (videoPath.startsWith('http')) {
    return videoPath;
  }
  return `${API_BASE_URL}${videoPath}`;
};

export const fetchMyCodes = async () => {
  const response = await api.get('/my-codes');
  return response.data.codes;
};

export const createRazorpayOrder = async (plan: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const response = await api.post('/api/create-razorpay-order', {
      plan,
      uid: user.uid
    });
    return response.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export { api };