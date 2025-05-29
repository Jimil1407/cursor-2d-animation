import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Globe, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import { getDatabase, ref, onValue, remove, set, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { getAuth, deleteUser } from 'firebase/auth';

const useUsageStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const statsRef = ref(db, `usage_stats/${user.uid}`);
    const unsubscribe = onValue(statsRef, (snapshot) => {
      setStats(snapshot.val());
    });
    return () => unsubscribe();
  }, [user]);

  return stats;
};

const SettingsPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [deleteAccountSuccess, setDeleteAccountSuccess] = useState(false);

  // Load notification preferences from Firebase on mount
  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const notifRef = ref(db, `users/${user.uid}/settings/notifications`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNotifications((prev) => ({ ...prev, ...data }));
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Update notification preference in Firebase
  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      if (user) {
        const db = getDatabase();
        const notifRef = ref(db, `users/${user.uid}/settings/notifications`);
        update(notifRef, { [key]: updated[key] });
      }
      return updated;
    });
  };

  const handleDeleteAllChats = async () => {
    if (!user) return;
    setDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(false);
    try {
      const db = getDatabase();
      const codesRef = ref(db, `users/${user.uid}/codes`);
      await remove(codesRef);
      setDeleteSuccess(true);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete chats.');
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeletingAccount(true);
    setDeleteAccountError(null);
    setDeleteAccountSuccess(false);
    try {
      // Delete user data from Realtime Database
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      await remove(userRef);
      // Delete user from Firebase Auth
      const auth = getAuth();
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        setDeleteAccountSuccess(true);
      } else {
        throw new Error('No authenticated user found.');
      }
    } catch (err: any) {
      setDeleteAccountError(err.message || 'Failed to delete account.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Customize your experience and manage your preferences.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                {isDarkMode ? (
                  <Moon className="h-6 w-6 text-purple-600" />
                ) : (
                  <Sun className="h-6 w-6 text-purple-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Appearance
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Customize how PromptMotion looks
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">
                Dark Mode
              </span>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your notification preferences
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {key} Notifications
                  </span>
                  <button
                    onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Privacy
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your privacy settings
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <button
                className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => setShowConfirm(true)}
                disabled={deleting}
              >
                Delete All Chats
              </button>
              <button
                className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => setShowDeleteAccount(true)}
                disabled={deletingAccount}
              >
                Delete Account
              </button>
              {deleteError && (
                <div className="text-red-600 dark:text-red-400 text-sm mt-2">{deleteError}</div>
              )}
              {deleteSuccess && (
                <div className="text-green-600 dark:text-green-400 text-sm mt-2">All chats deleted successfully.</div>
              )}
              {deleteAccountError && (
                <div className="text-red-600 dark:text-red-400 text-sm mt-2">{deleteAccountError}</div>
              )}
              {deleteAccountSuccess && (
                <div className="text-green-600 dark:text-green-400 text-sm mt-2">Account deleted successfully.</div>
              )}
            </div>
            {/* Confirmation Dialog for Delete All Chats */}
            {showConfirm && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-sm w-full">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
                  <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete all your chats? This action cannot be undone.</p>
                  <div className="flex justify-end gap-4">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => setShowConfirm(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                      onClick={handleDeleteAllChats}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Confirmation Dialog for Delete Account */}
            {showDeleteAccount && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-sm w-full">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Confirm Account Deletion</h3>
                  <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete your account? This will remove all your data and cannot be undone.</p>
                  <div className="flex justify-end gap-4">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => setShowDeleteAccount(false)}
                      disabled={deletingAccount}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                    >
                      {deletingAccount ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 