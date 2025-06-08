import axios from 'axios';
import { GenerationResponse, CodeResponse } from '../types';
import { getAuth } from 'firebase/auth';

const API_URL = 'https://promptmotion-backend-v1.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      }
    });
    return Promise.reject(error);
  }
);

export const generateAnimation = async (prompt: string): Promise<GenerationResponse> => {
  try {
    const response = await api.post<GenerationResponse>('/generate', { prompt });
    return response.data;
  } catch (error: any) {
    console.error('Error generating animation:', error.response?.data || error.message);
    throw error;
  }
};

export const getCode = async (sceneFileId: string): Promise<string> => {
  try {
    const response = await api.get<CodeResponse>(`/code/${sceneFileId}`);
    return response.data.code;
  } catch (error: any) {
    console.error('Error fetching code:', error.response?.data || error.message);
    throw error;
  }
};

export const updateCode = async (sceneFileId: string, code: string): Promise<void> => {
  try {
    await api.put(`/code/${sceneFileId}`, { code });
  } catch (error: any) {
    console.error('Error updating code:', error.response?.data || error.message);
    throw error;
  }
};

export const getVideoUrl = (videoPath: string): string => {
  if (!videoPath) return '';
  if (videoPath.startsWith('http')) {
    return videoPath;
  }
  return `${API_URL}${videoPath}`;
};

export const fetchMyCodes = async () => {
  try {
    const response = await api.get('/my-codes');
    return response.data.codes || [];
  } catch (error: any) {
    console.error('Error fetching codes:', error.response?.data || error.message);
    return [];
  }
};

export const createRazorpayOrder = async (plan: string) => {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error('User not authenticated');
    const response = await api.post('/api/create-razorpay-order', {
      plan,
      uid: user.uid
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error.response?.data || error.message);
    throw error;
  }
};

export const cancelSubscription = async () => {
  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error('User not authenticated');
    const response = await api.post('/api/cancel-subscription', {
      uid: user.uid
    });
    return response.data;
  } catch (error: any) {
    console.error('Error cancelling subscription:', error.response?.data || error.message);
    throw error;
  }
};

export default api;