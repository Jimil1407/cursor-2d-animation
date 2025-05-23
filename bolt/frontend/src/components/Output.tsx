import React from "react";
import { motion } from "framer-motion";
import { Video } from "lucide-react";

type Props = {
  outputUrl: string | null;
};

export default function OutputViewer({ outputUrl }: Props) {
  if (!outputUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 space-y-4"
    >
      <div className="flex items-center gap-2 text-gray-300">
        <Video className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Animation Preview</h2>
      </div>

      <div className="relative group">
        <video
          src={outputUrl}
          controls
          style={{ width: "400px", height: "auto" }}
          className="mx-auto rounded-lg shadow-md border border-gray-700/50 bg-black"
          controlsList="nodownload"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open(outputUrl, "_blank")}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          Open in New Tab
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const link = document.createElement("a");
            link.href = outputUrl;
            link.download = "animation.mp4";
            link.click();
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
        >
          Download
        </motion.button>
      </div>
    </motion.div>
  );
}
