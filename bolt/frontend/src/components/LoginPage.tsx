import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import logo from './logo.png';

const PromptStudioLogo = () => (
  <div className="mx-auto mb-6 w-20 h-20 rounded-full ring-4 ring-purple-600 flex items-center justify-center bg-white dark:bg-gray-900">
    <img src={logo} alt="PromptMotion Logo" className="h-12 w-auto" />
  </div>
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithEmail, signInWithGoogle, signInWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign in');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign in with Google');
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithGithub();
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign in with GitHub');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-sm bg-white/20 dark:bg-gray-800/20 rounded-lg p-8 ring-1 ring-gray-200 dark:ring-gray-700 shadow-lg">
          
          <PromptStudioLogo />

          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-700/70 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-700/70 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              Sign in with Email
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  className="w-5 h-5 mr-2"
                  alt="Google logo"
                />
                Google
              </button>

              <button
                onClick={handleGithubLogin}
                className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
