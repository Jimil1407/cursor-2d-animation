import React, { useState } from "react";
import RenderForm from "./components/Render";
import OutputViewer from "./components/Output";
import CodeEditor from "./components/CodeEditor";
import { motion } from "framer-motion";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [sceneFileId, setSceneFileId] = useState<string | null>(null);

  const handleRender = async (prompt: string) => {
    setLoading(true);
    setOutputUrl(null);
    setSceneFileId(null);

    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        const videoUrl = `http://localhost:8000${data.video_path}`;
        setOutputUrl(videoUrl);
        setSceneFileId(data.scene_file_id);
      } else {
        throw new Error("Failed to generate video");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // New callback to update video url when code changes and re-renders video
  const handleUpdatedVideo = (newVideoUrl: string) => {
    setOutputUrl(newVideoUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-6 py-10 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Cursor for 2D Animation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl mb-8 text-gray-400"
          >
            Transform your ideas into stunning animations with AI-powered code generation
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50 mb-10"
        >
          <RenderForm onSubmit={handleRender} loading={loading} />
          <OutputViewer outputUrl={outputUrl} />
        </motion.div>

        {sceneFileId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800/40 p-6 rounded-xl border border-gray-700/40"
          >
            <h2 className="text-xl font-semibold mb-4 text-purple-400">
              ✏️ Edit Generated Python Code
            </h2>
            <CodeEditor sceneFileId={sceneFileId} onUpdateVideo={handleUpdatedVideo} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
