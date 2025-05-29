import axios from 'axios';
import { GenerationResponse, CodeResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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