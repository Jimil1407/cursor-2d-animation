import React, { useState } from "react";
import { motion } from "framer-motion";
import { Github, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "./logo.png";

const PromptStudioLogo = () => (
  <div className="flex flex-col items-center justify-center mb-6">
    <div className="w-24 h-24 rounded-full ring-4 ring-purple-600 flex items-center justify-center bg-white dark:bg-gray-900 mb-4 shadow-lg">
      <img src={logo} alt="PromptMotion Logo" className="h-16 w-auto" />
    </div>
  </div>
);

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
    <div className="min-h-screen flex">
      {/* Left side branding/info */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-purple-700 via-purple-900 to-indigo-900 text-white flex-col justify-center px-16">
        <PromptStudioLogo />
        <div className="flex flex-col items-center justify-center mb-6">
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-5xl font-bold mb-6 max-w-md leading-snug"
        >
          PromptMotion
        </motion.h1>
        </div>
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-4xl font-bold mb-6 max-w-md leading-snug"
        >
          Welcome to PromptMotion — your AI-powered animation studio.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="max-w-md text-purple-200 text-lg"
        >
          Create stunning videos from prompts, edit code, and build your
          animation history — all in one place.
        </motion.p>
      </div>

      {/* Right side form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 md:px-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto w-full"
        >
          {/* <PromptStudioLogo /> */}

          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white tracking-tight">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleEmailAuth} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
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
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 rounded-md bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700 transition"
            >
              <Mail className="w-6 h-6" />
              {isSignUp ? "Sign Up with Email" : "Sign In with Email"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
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
                className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition px-4 py-3 font-medium"
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
                className="w-full flex items-center justify-center gap-3 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 transition px-4 py-3"
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
