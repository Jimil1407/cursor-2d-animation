import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, LogOut, User, CreditCard, Activity, Settings, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: User, label: 'Profile', onClick: () => navigate('/profile') },
    { icon: CreditCard, label: 'Billing', onClick: () => navigate('/billing') },
    { icon: Activity, label: 'Usage', onClick: () => navigate('/usage') },
    { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-6 px-4 sm:px-6 lg:px-8 bg-white/10 dark:bg-gray-900/10 border-b border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <motion.div
            whileHover={{ rotate: 5 }}
            className="mr-3 p-2 rounded-lg ring-2 ring-purple-500 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="text-2xl font-bold text-purple-600">PM</span>
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
          {user && (
            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <User className="h-5 w-5" />
                <span>{user.email?.split('@')[0]}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999]"
                  >
                    <div className="py-1">
                      {menuItems.map((item, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            item.onClick();
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </motion.button>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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