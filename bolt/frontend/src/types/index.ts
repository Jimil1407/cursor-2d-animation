export interface GenerationResponse {
  video_path: string;
  scene_file_id: string;
}

export interface CodeResponse {
  code: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  videoPath: string;
  sceneFileId: string;
  timestamp: number;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';