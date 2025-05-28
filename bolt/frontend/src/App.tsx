import  { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { generateAnimation, getCode } from "./services/api";
import { GenerationResponse, HistoryItem, Status } from "./types";
import PromptForm from "./components/PromptForm";
import VideoPlayer from "./components/VideoPlayer";
import CodeEditor from "./components/CodeEditor";
import HistoryPanel from "./components/HistoryPanel";
import Header from "./components/Header";
import ErrorMessage from "./components/ErrorMessage";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

function MainApp() {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [sceneFileId, setSceneFileId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleGenerateAnimation = async (promptText: string) => {
    setStatus("loading");
    setError(null);
    setPrompt(promptText);

    try {
      const response: GenerationResponse = await generateAnimation(promptText);
      setVideoPath(response.video_path);
      setSceneFileId(response.scene_file_id);

      const codeText = await getCode(response.scene_file_id);
      setCode(codeText);

      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        prompt: promptText,
        videoPath: response.video_path,
        sceneFileId: response.scene_file_id,
        timestamp: Date.now(),
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
      setStatus("success");
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to generate animation. Please try again.");
      setStatus("error");
    }
  };

  const handleSelectHistoryItem = async (item: HistoryItem) => {
    setPrompt(item.prompt);
    setVideoPath(item.videoPath);
    setSceneFileId(item.sceneFileId);

    try {
      const codeText = await getCode(item.sceneFileId);
      setCode(codeText);
    } catch (err) {
      console.error("Error fetching code for history item:", err);
      setError("Failed to load code for this animation.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Toaster position="top-right" />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <PromptForm onSubmit={handleGenerateAnimation} status={status} />

            <AnimatePresence>
              {error && (
                <ErrorMessage
                  message={error}
                  onDismiss={() => setError(null)}
                />
              )}
            </AnimatePresence>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-1/2">
                <VideoPlayer videoPath={videoPath} prompt={prompt} />
              </div>
              <div className="w-full lg:w-1/2">
                <CodeEditor
                  sceneFileId={sceneFileId}
                  onUpdateVideo={(videoUrl) => setVideoPath(videoUrl)}
                />
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/4">
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistoryItem}
              currentId={
                history.find((item) => item.sceneFileId === sceneFileId)
                  ?.id || null
              }
              onClose={() => {}}
            />
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Built by Jimil Digaswala.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainApp />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;