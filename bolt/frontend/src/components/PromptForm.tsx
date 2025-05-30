import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import { Status } from '../types';
import { Button } from './Button';

interface PromptFormProps {
  onSubmit: (prompt: string) => Promise<void>;
  status: Status;
}

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, status }) => {
  const [prompt, setPrompt] = useState('');
  const isLoading = status === 'loading';

  console.log('Button disabled:', !prompt.trim() || isLoading, { prompt, isLoading });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      await onSubmit(prompt);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-8"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Describe your animation
      </h2>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative backdrop-blur-sm bg-white/20 dark:bg-gray-800/20 rounded-lg p-1 ring-1 ring-gray-200 dark:ring-gray-700 shadow-lg">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the 2D animation you want to create... (e.g., 'Animate a bouncing ball')"
            className="w-full p-4 h-32 bg-white/70 dark:bg-gray-800/70 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            disabled={isLoading}
          />
          <div className="flex justify-end p-2 bg-gray-50/80 dark:bg-gray-700/80 rounded-b-lg">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-800 to-gray-900 text-white hover:from-purple-700 hover:to-gray-800 transition-colors"
            >
              {status === 'loading' ? 'Generating...' : 'Render Animation'}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default PromptForm;