import React, { useState } from "react";
import { motion } from "framer-motion";
import { Github, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from '../components/logo.png';

const PromptStudioLogo = () => (
  <div className="flex flex-col items-center justify-center mb-6">
    <img src={logo} alt="PromptMotion Logo" className="w-24 h-24 rounded-full ring-4 ring-purple-600 bg-white dark:bg-gray-900 mb-4 shadow-lg object-cover" />
  </div>
);

// Fun animated PromptMotion text with lighter gradient
const FunPromptMotion = () => {
  const text = "PromptMotion";
  return (
    <motion.span
      className="inline-block relative text-5xl font-bold mb-6 max-w-md leading-snug"
      style={{
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        backgroundImage: 'linear-gradient(90deg, #e9d5ff, #fbcfe8, #dbeafe, #e9d5ff)', // lighter pastel colors
        backgroundSize: '200% auto',
      }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: 30, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 * i, type: "spring", stiffness: 400, damping: 20 }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGithub,
  } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast.success("Account created!");
      } else {
        await signInWithEmail(email, password);
      }
      navigate("/");
    } catch (error) {
      toast.error(isSignUp ? "Failed to sign up" : "Failed to sign in");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign in with Google");
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithGithub();
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign in with GitHub");
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated gradient blobs and extra bg elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-400 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-indigo-400 opacity-20 rounded-full blur-2xl animate-pulse z-0" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-400 opacity-20 rounded-full blur-2xl animate-pulse z-0" />
      {/* Animated wave at bottom */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, type: 'spring', bounce: 0.3 }}
        className="absolute bottom-0 left-0 w-full h-32 z-0"
      >
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="#e9d5ff" fillOpacity="0.18" d="M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,197.3C840,224,960,224,1080,197.3C1200,171,1320,117,1380,90.7L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
        </svg>
      </motion.div>
      {/* Floating shapes */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.7 }}
        className="absolute top-24 left-1/4 w-16 h-16 bg-purple-200 opacity-30 rounded-full blur-2xl z-0 animate-bounce"
      />
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 1 }}
        className="absolute top-1/3 right-1/3 w-12 h-12 bg-blue-200 opacity-30 rounded-full blur-2xl z-0 animate-pulse"
      />
      {/* Smooth animated pastel blob on right side */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0.7 }}
        animate={{ scale: [0.9, 1.05, 0.95, 1], opacity: [0.7, 0.9, 0.8, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="hidden lg:block absolute right-10 top-1/4 w-96 h-96 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 opacity-60 rounded-full blur-3xl z-0"
      />
      {/* Left side branding/info */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-purple-700 via-purple-900 to-indigo-900 text-white flex-col justify-center px-16 relative z-10">
        <PromptStudioLogo />
        <div className="flex flex-col items-center justify-center mb-6">
          <FunPromptMotion />
        </div>
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-4xl font-bold mb-6 max-w-md leading-snug"
        >
          <motion.span
            initial={{ color: '#fff' }}
            animate={{ color: ['#fff', '#a78bfa', '#fff'] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          >
            Welcome to PromptMotion — your AI-powered animation studio.
          </motion.span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="max-w-md text-purple-200 text-lg"
        >
          Create stunning videos from prompts, edit code, and build your
          animation history — all in one place.
        </motion.p>
      </div>

      {/* Right side form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 md:px-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto w-full bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-2xl p-8 backdrop-blur-lg border border-white/30 dark:border-gray-800/40"
        >
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white tracking-tight">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>

          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {isSignUp ? "Sign up for a new account" : "Sign in to continue to your account"}
            </p>
          </div>
          <form onSubmit={handleEmailAuth} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700 active:scale-95 transition-all shadow-md hover:shadow-lg"
            >
              <Mail className="w-6 h-6" />
              {isSignUp ? "Sign Up with Email" : "Sign In with Email"}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              By signing in, you agree to our <a href="/terms" className="text-purple-600 hover:text-purple-700">Terms of Service</a> and <a href="/privacy" className="text-purple-600 hover:text-purple-700">Privacy Policy</a>.
            </p>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-600 dark:text-purple-400 font-medium hover:underline transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>
          </div>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-50 dark:bg-gray-900 text-gray-500 select-none">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all px-4 py-3 font-medium shadow-sm hover:shadow-md"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="w-6 h-6"
                />
                Google
              </button>

              <button
                onClick={handleGithubLogin}
                className="w-full flex items-center justify-center gap-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 active:scale-95 transition-all px-4 py-3 shadow-sm hover:shadow-md"
              >
                <Github className="w-6 h-6" />
                GitHub
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage; 