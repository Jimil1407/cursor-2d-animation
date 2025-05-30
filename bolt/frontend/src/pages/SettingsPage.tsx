import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Globe, Moon, Sun, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import { getDatabase, ref, onValue, remove, set, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { getAuth, deleteUser, updatePassword, signOut } from 'firebase/auth';

const useUsageStats = (): any => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

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

// For device info
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  let platform = navigator.platform || 'Unknown';
  return { browser, platform };
};

const SettingsPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [deleteAccountSuccess, setDeleteAccountSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const stats = useUsageStats();
  const accountType = stats?.account_type || 'free';
  const [defaultQuality, setDefaultQuality] = useState('720p');
  const [qualitySuccess, setQualitySuccess] = useState('');
  const [qualityError, setQualityError] = useState('');
  const [qualityLoading, setQualityLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load default quality from Firebase
  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const qualityRef = ref(db, `users/${user.uid}/settings/defaultQuality`);
    const unsubscribe = onValue(qualityRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setDefaultQuality(val);
    });
    return () => unsubscribe();
  }, [user]);

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

  const { browser, platform } = getDeviceInfo();
  const lastActive = new Date().toLocaleString();

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

          {/* Default Animation Quality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Default Animation Quality
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose your preferred default quality for new renders.
                </p>
              </div>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setQualityLoading(true);
                setQualitySuccess('');
                setQualityError('');
                try {
                  if (!user) throw new Error('Not logged in');
                  const db = getDatabase();
                  const qualityRef = ref(db, `users/${user.uid}/settings/defaultQuality`);
                  await set(qualityRef, defaultQuality);
                  setQualitySuccess('Default quality updated!');
                } catch (err: any) {
                  setQualityError(err.message || 'Failed to update quality.');
                } finally {
                  setQualityLoading(false);
                }
              }}
              className="space-y-1"
            >
              <label htmlFor="default-quality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quality
              </label>
              <div className="relative flex items-center mb-4">
                <select
                  id="default-quality"
                  value={defaultQuality}
                  onChange={e => setDefaultQuality(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-base text-gray-900 dark:text-gray-100 shadow focus:border-purple-500 focus:ring-2 focus:ring-purple-500 appearance-none pr-10 pl-4 transition-all"
                  disabled={qualityLoading}
                >
                  <option value="720p">720p</option>
                  {(accountType === 'plus' || accountType === 'pro') && <option value="1080p">1080p</option>}
                  {accountType === 'pro' && <option value="4k">4K</option>}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 text-gray-400 dark:text-gray-300 h-5 w-5" style={{ top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {qualitySuccess && <p className="text-green-600 text-sm mb-2">{qualitySuccess}</p>}
              {qualityError && <p className="text-red-600 text-sm mb-2">{qualityError}</p>}
              <button
                type="submit"
                className="w-full h-11 py-2 px-4 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 text-base"
                disabled={qualityLoading}
              >
                {qualityLoading ? 'Saving...' : 'Save Quality'}
              </button>
            </form>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Lock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Change Password
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Update your account password
                </p>
              </div>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPasswordLoading(true);
                setPasswordSuccess('');
                setPasswordError('');
                try {
                  const auth = getAuth();
                  if (auth.currentUser) {
                    await updatePassword(auth.currentUser, newPassword);
                    setPasswordSuccess('Password updated successfully!');
                    setNewPassword('');
                  } else {
                    setPasswordError('No authenticated user found.');
                  }
                } catch (err: any) {
                  setPasswordError(err.message || 'Failed to update password.');
                } finally {
                  setPasswordLoading(false);
                }
              }}
              className="space-y-1"
            >
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative flex items-center mb-4">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-base text-gray-900 dark:text-gray-100 shadow focus:border-purple-500 focus:ring-2 focus:ring-purple-500 pr-10 pl-4 transition-all"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordSuccess && <p className="text-green-600 text-sm mb-2">{passwordSuccess}</p>}
              {passwordError && <p className="text-red-600 text-sm mb-2">{passwordError}</p>}
              <button
                type="submit"
                className="w-full h-11 py-2 px-4 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 text-base"
                disabled={passwordLoading || !newPassword}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </motion.div>

          {/* Active Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Active Sessions
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage your logged-in devices.
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">This Device</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{browser} on {platform}</div>
                  <div className="text-xs text-gray-400">Last active: {lastActive}</div>
                </div>
                <button
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => signOut(getAuth())}
                >
                  Log out
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-400">Other sessions will appear here in the future.</div>
          </motion.div>

          {/* Privacy (Delete All Chats, Delete Account) */}
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