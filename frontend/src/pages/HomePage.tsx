import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FunHomeHeadline, FunHomeSubheadline } from '../components/FunHomeHeadline';
import { PromptForm } from '../components/PromptForm';
import { VideoPlayer } from '../components/VideoPlayer';
import { CodeEditor } from '../components/CodeEditor';
import { HistoryPanel } from '../components/HistoryPanel';
import { ErrorMessage } from '../components/ErrorMessage';

const HomePage: React.FC = () => {
  const [videoPath, setVideoPath] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sceneFileId, setSceneFileId] = useState('');
  const [history, setHistory] = useState([]);
  const [currentId, setCurrentId] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleGenerateAnimation = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation of handleGenerateAnimation
  };

  const handleUpdateVideo = (videoUrl: string) => {
    setVideoPath(videoUrl);
  };

  const handleSelectHistoryItem = (id: string) => {
    setCurrentId(id);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
        <div className="w-full lg:w-3/4">
          {/* Animated headline and subheadline */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <FunHomeHeadline />
            <FunHomeSubheadline />
          </div>
          <PromptForm onSubmit={handleGenerateAnimation} status={status} />

          <AnimatePresence>
            {error && (
              <ErrorMessage
                message={error}
                onDismiss={() => setError(null)}
              />
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-4 sm:mt-6">
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

        <div className="w-full lg:w-1/4 mt-4 lg:mt-0">
          <HistoryPanel
            history={history}
            onSelect={handleSelectHistoryItem}
            currentId={currentId}
            onClose={() => {}}
          />
        </div>
      </div>
    </main>
  );
};

export default HomePage; 