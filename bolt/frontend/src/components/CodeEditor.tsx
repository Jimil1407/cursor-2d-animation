import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { Save, Loader2, AlertCircle } from 'lucide-react';
//import toast from 'react-hot-toast';

type Props = {
  sceneFileId: string | null;
  onUpdateVideo: (videoUrl: string) => void;
};

export default function CodeEditor({ sceneFileId, onUpdateVideo }: Props) {
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!sceneFileId) return;
    
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
  if (!sceneFileId) return null;
  
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
      onUpdateVideo(data.video_url);  // Use the Firebase video URL directly

    } catch (err) {
      setError("Failed to save changes. Please try again.");
      console.error("Error saving code:", err);
    } finally {
      setSaving(false);
    }
  };

  //if (!sceneFileId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full backdrop-blur-sm bg-white/20 dark:bg-gray-800/20 rounded-lg p-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Manim Python Code
        </h2>
        <div className="flex gap-2">
          {isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-colors ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Edit Code
            </motion.button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div
        className={`rounded-lg overflow-hidden shadow-inner ${
          isEditing ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-300 dark:ring-gray-600'
        }`}
      >
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          </div>
        ) : (
          <Editor
            value={code}
            onValueChange={value => isEditing && setCode(value)}
            highlight={code => highlight(code, languages.python, 'python')}
            padding={16}
            readOnly={!isEditing}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: '14px',
              minHeight: '300px',
              backgroundColor: '#1e1e2e',
              color: '#f8f8f2',
            }}
            className="w-full"
          />
        )}
      </div>

      {isEditing && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Make your changes to the code and click "Save Changes" to update the animation.
        </p>
      )}
    </motion.div>
  );
};
