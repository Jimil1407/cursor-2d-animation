export interface GenerationResponse {
  video_url: string;
  scene_file_id: string;
}

export interface CodeResponse {
  code: string;
}

export interface HistoryItem {
  scene_file_id: string;
  code: string;
  timestamp: string;
  status: string;
  video_url: string;
  prompt?: string;
  title?: string;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';