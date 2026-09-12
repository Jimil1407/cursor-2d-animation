import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { generateAnimation, fetchMyCodes } from '../services/api';
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

const SPARKLE_COUNT = 40;

const FOOTER_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
];

// Re-rendering a scene reuses its URL, so a cache buster is needed to make the
// <video> element refetch. Appends correctly whether or not a query exists.
const withCacheBuster = (url: string) =>
  url ? `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}` : '';

// Subtle sparkling background effect. Memoised at module scope and rendered by a
// memo component: the positions used to be re-randomised on every parent render,
// which restarted 100 infinite animations each time.
const SPARKLES = Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 3,
  delay: Math.random() * 2,
}));

const SparkleBackground = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {SPARKLES.map((sparkle) => (
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
          clipPath:
            'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        }}
      />
    ))}
  </div>
));
SparkleBackground.displayName = 'SparkleBackground';

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [sceneFileId, setSceneFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ limit: number; account_type: string } | null>(null);
  const { user, loading } = useAuth();

  const refreshHistory = useCallback(() => {
    fetchMyCodes()
      .then(setHistory)
      .catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    if (!loading && user) refreshHistory();
  }, [loading, user, refreshHistory]);

  const handleGenerateAnimation = async (promptText: string) => {
    setStatus('loading');
    setError(null);
    setPrompt(promptText);

    try {
      const response: GenerationResponse = await generateAnimation(promptText);
      setVideoPath(withCacheBuster(response.video_url));
      // CodeEditor fetches the source for this id itself; doing it here too was
      // a wasted round trip.
      setSceneFileId(response.scene_file_id ?? null);
      refreshHistory();
      setStatus('success');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, unknown> } }).response?.data ?? {};
      const detail = (data.detail ?? data) as Record<string, unknown>;

      if (detail.code === 'LIMIT_REACHED') {
        setLimitInfo({
          limit: Number(detail.limit ?? 0),
          account_type: String(detail.account_type ?? 'free'),
        });
        setShowUpgradePopup(true);
      } else {
        setError(
          typeof detail.message === 'string'
            ? detail.message
            : 'Failed to generate animation. Please try again.'
        );
      }
      setStatus('error');
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setPrompt(item.title ?? null);
    setVideoPath(withCacheBuster(item.video_url));
    setSceneFileId(item.scene_file_id);
  };

  const handleUpdateVideo = (videoUrl: string) => {
    setVideoPath(withCacheBuster(videoUrl));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200 relative">
      <SparkleBackground />
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
              currentId={sceneFileId}
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
            {FOOTER_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {label}
              </Link>
            ))}
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