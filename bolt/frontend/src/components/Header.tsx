import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Code2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-6 px-4 sm:px-6 lg:px-8 backdrop-blur-sm bg-white/10 dark:bg-gray-900/10 border-b border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <motion.div
            whileHover={{ rotate: 5 }}
            className="bg-gradient-to-r from-purple-600 to-blue-500 p-2 rounded-lg mr-3"
          >
            <Code2 className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manim Studio
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create beautiful math animations with AI
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;