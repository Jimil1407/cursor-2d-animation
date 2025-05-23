import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { Save, AlertCircle } from "lucide-react";

type Props = {
  sceneFileId: string;
  onUpdateVideo: (videoUrl: string) => void;  // New prop for notifying parent
};

export default function CodeEditor({ sceneFileId, onUpdateVideo }: Props) {
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:8000/code/${sceneFileId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch code");
        }
        const codeText = await response.text();
        setCode(codeText);
      } catch (err) {
        setError("Failed to load code. Please try again.");
        console.error("Error fetching code:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [sceneFileId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      console.log("Saving code:", code);

      const response = await fetch(`http://localhost:8000/code/${sceneFileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to save code");
      }

      const data = await response.json();
      const newVideoUrl = `http://localhost:8000${data.video_path}`;
      onUpdateVideo(newVideoUrl);  // Notify parent of new video url

    } catch (err) {
      setError("Failed to save changes. Please try again.");
      console.error("Error saving code:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-purple-400">Edit Python Scene</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 text-white rounded-lg transition-colors duration-200"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="border border-gray-700/50 rounded-lg overflow-hidden">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center bg-gray-900/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          </div>
        ) : (
          <Editor
            height="400px"
            defaultLanguage="python"
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
