import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, User, LogIn, UserPlus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import logo from './logo.png';

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
            className="mr-3 p-2 rounded-lg ring-2 ring-purple-500"
          >
            <img src={logo} alt="PromptMotion Logo" className="h-12 w-auto" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              PromptMotion
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create beautiful math animations with AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLoggedIn(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-white/20 transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                <span>Sign Up</span>
              </motion.button>
            </>
          )}
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
      </div>
    </motion.header>
  );
};

export default Header;