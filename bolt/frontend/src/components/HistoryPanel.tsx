import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Film } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  currentId: string | null;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, currentId }) => {
  if (!history.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-8 backdrop-blur-sm bg-white/20 dark:bg-gray-800/20 rounded-lg p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-lg"
    >
      <div className="flex items-center mb-4">
        <Clock className="w-5 h-5 text-purple-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Recent Animations
        </h2>
      </div>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {history.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelect(item)}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              currentId === item.id
                ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                : 'bg-white/60 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-600/60'
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <Film className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.prompt}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default HistoryPanel;