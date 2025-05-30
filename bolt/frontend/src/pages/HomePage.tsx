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
import { UpgradePopup } from '../components/UpgradePopup';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Typewriter + shimmer effect for headline
const FunHomeHeadline = () => {
  const text = 'Create your animation';
  const [displayed, setDisplayed] = React.useState('');
  React.useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <motion.h1
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
      className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 bg-clip-text text-transparent animate-shimmer"
      style={{ WebkitTextFillColor: 'transparent' }}
    >
      {displayed}
    </motion.h1>
  );
};

const FunHomeSubheadline = () => (
  <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 1 }}
    className="text-lg text-gray-600 dark:text-gray-300 mb-6"
  >
    Describe your mathematical animation and let AI do the magic.
  </motion.p>
);

// Subtle sparkling background effect
const SparkleBackground = () => {
  const sparkles = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 5 + 3,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: sparkle.delay }}
          style={{
            position: 'absolute',
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          }}
        />
      ))}
    </div>
  );
};

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [sceneFileId, setSceneFileId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ limit: number; account_type: string } | null>(null);
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
    } catch (err: any) {
      console.error('Error:', err);
      // Check both top-level and .detail for LIMIT_REACHED
      const code = err.response?.data?.code || err.response?.data?.detail?.code;
      const limit = err.response?.data?.limit || err.response?.data?.detail?.limit;
      const accountType = err.response?.data?.account_type || err.response?.data?.detail?.account_type;
      if (code === 'LIMIT_REACHED') {
        setLimitInfo({
          limit: limit,
          account_type: accountType
        });
        setShowUpgradePopup(true);
      } else {
        setError('Failed to generate animation. Please try again.');
      }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200 relative">
      <SparkleBackground />
      <Toaster position="top-right" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            {/* Animated headline and subheadline */}
            <FunHomeHeadline />
            <FunHomeSubheadline />
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

      <footer className="w-full mt-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>Built by <a href="https://github.com/Jimil1407" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Jimil Digaswala</a>.</p>
          </div>
          <div className="flex space-x-4">
            <a href="/about" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">About</a>
            <a href="/contact" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Contact</a>
            <a href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Privacy Policy</a>
            <a href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>

      {limitInfo && (
        <UpgradePopup
          isOpen={showUpgradePopup}
          onClose={() => setShowUpgradePopup(false)}
          currentPlan={limitInfo.account_type}
          limit={limitInfo.limit}
        />
      )}
    </div>
  );
};

export default HomePage; 