export type AccountType = 'free' | 'plus' | 'pro';

export interface GenerationResponse {
  video_url: string;
  scene_file_id: string;
  usage: number;
  limit: number;
  account_type: AccountType;
}

export interface CodeResponse {
  code: string;
}

export interface UpdateCodeResponse {
  status: string;
  video_url: string;
  scene_file_id: string;
}

/** Summary returned by `/my-codes`; the source is fetched on demand. */
export interface HistoryItem {
  scene_file_id: string;
  timestamp: string;
  status: string;
  video_url: string;
  title?: string;
  prompt?: string;
}

export interface UsageStats {
  totalAnimations: number;
  remainingAnimations: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastUpdated: string;
  account_type: AccountType;
  limit: number;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';
