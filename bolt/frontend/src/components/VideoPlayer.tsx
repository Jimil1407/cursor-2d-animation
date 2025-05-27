import React from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink } from 'lucide-react';
import { getVideoUrl } from '../services/api';

interface VideoPlayerProps {
  videoPath: string | null;
  prompt: string | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoPath, prompt }) => {
  if (!videoPath) return null;

  const videoUrl = videoPath?.startsWith("http") ? videoPath : getVideoUrl(videoPath);
  console.log(videoUrl);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mb-8 backdrop-blur-sm bg-white/20 dark:bg-gray-800/20 rounded-lg p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
        Generated Animation
      </h2>
      {prompt && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic">
          "{prompt}"
        </p>
      )}
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video shadow-md">
        <video
          src={videoUrl}
          controls
          controlsList="nodownload"
          className="w-full h-full object-contain"
          autoPlay
          loop
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in New Tab
        </a>
        <a
          href={videoUrl}
          download
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </a>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;