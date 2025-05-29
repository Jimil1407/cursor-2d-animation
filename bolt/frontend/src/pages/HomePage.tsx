import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { generateAnimation, getCode, fetchMyCodes } from '../services/api';
import { GenerationResponse, HistoryItem, Status } from '../types';
import PromptForm from '../components/PromptForm';
import VideoPlayer from '../components/VideoPlayer';
import CodeEditor from '../components/CodeEditor';
import HistoryPanel from '../components/HistoryPanel';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [sceneFileId, setSceneFileId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      fetchMyCodes().then(setHistory);
    }
  }, [loading, user]);

  const getCacheBustedUrl = (url: string) => url + '?v=' + Math.random().toString(36).substring(2);

  const handleGenerateAnimation = async (promptText: string) => {
    setStatus('loading');
    setError(null);
    setPrompt(promptText);

    try {
      const response: GenerationResponse = await generateAnimation(promptText);
      setVideoPath(getCacheBustedUrl(response.video_url));
      setSceneFileId(response.scene_file_id !== undefined ? response.scene_file_id : null);
      setCurrentId(response.scene_file_id !== undefined ? response.scene_file_id : null);

      const codeText = await getCode(response.scene_file_id);
      setCode(codeText);

      // Refetch history after new animation
      fetchMyCodes().then(setHistory);
      setStatus('success');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to generate animation. Please try again.');
      setStatus('error');
    }
  };

  const handleSelectHistoryItem = async (item: HistoryItem) => {
    setPrompt(item.prompt ?? null);
    setVideoPath(getCacheBustedUrl(item.video_url));
    setSceneFileId(item.scene_file_id);
    setCurrentId(item.scene_file_id);

    try {
      const codeText = await getCode(item.scene_file_id);
      setCode(codeText);
    } catch (err) {
      console.error('Error fetching code for history item:', err);
      setError('Failed to load code for this animation.');
    }
  };

  // Update video after code update, but do not refetch history
  const handleUpdateVideo = (videoUrl: string) => {
    setVideoPath(getCacheBustedUrl(videoUrl));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Toaster position="top-right" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <PromptForm onSubmit={handleGenerateAnimation} status={status} />

            <AnimatePresence>
              {error && (
                <ErrorMessage
                  message={error}
                  onDismiss={() => setError(null)}
                />
              )}
            </AnimatePresence>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-1/2">
                <VideoPlayer videoUrl={videoPath} prompt={prompt} />
              </div>
              <div className="w-full lg:w-1/2">
                <CodeEditor
                  sceneFileId={sceneFileId}
                  onUpdateVideo={handleUpdateVideo}
                />
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/4">
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistoryItem}
              currentId={currentId}
              onClose={() => {}}
            />
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Built by Jimil Digaswala.</p>
      </footer>
    </div>
  );
};

export default HomePage; 