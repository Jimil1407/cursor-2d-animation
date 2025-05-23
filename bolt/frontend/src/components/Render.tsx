import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  onSubmit: (prompt: string) => void;
  loading: boolean;
};

export default function RenderForm({ onSubmit, loading }: Props) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt.trim());
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">
          Animation Prompt
        </label>
        <div className="relative">
          <input
            id="prompt"
            type="text"
            placeholder="e.g., Create a bouncing ball with a shadow"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Sparkles className="h-5 w-5 text-gray-500" />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Describe the animation you want to create. Be specific about colors, movements, and effects.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating Animation...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span>Generate Animation</span>
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
