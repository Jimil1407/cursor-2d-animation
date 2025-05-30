import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import BillingPage from './pages/BillingPage';
import UsagePage from './pages/UsagePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900">
      {!isLogin && <Header />}
      <main className="w-full h-full">{/* No container, no margin, no padding */}
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.35, ease: 'easeInOut' },
};

const AppRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.key}>
        <Route path="/login" element={
          <motion.div
            {...PAGE_TRANSITION}
            className="min-h-screen"
          >
            <LoginPage />
          </motion.div>
        } />
        <Route path="/about" element={
          <motion.div
            {...PAGE_TRANSITION}
            className="min-h-screen"
          >
            <AboutPage />
          </motion.div>
        } />
        <Route path="/contact" element={
          <motion.div
            {...PAGE_TRANSITION}
            className="min-h-screen"
          >
            <ContactPage />
          </motion.div>
        } />
        <Route path="/privacy" element={
          <motion.div
            {...PAGE_TRANSITION}
            className="min-h-screen"
          >
            <PrivacyPolicyPage />
          </motion.div>
        } />
        <Route path="/terms" element={
          <motion.div
            {...PAGE_TRANSITION}
            className="min-h-screen"
          >
            <TermsOfServicePage />
          </motion.div>
        } />
        <Route path="/" element={
          <PrivateRoute>
            <motion.div
              {...PAGE_TRANSITION}
              className="min-h-screen"
            >
              <HomePage />
            </motion.div>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <motion.div
              {...PAGE_TRANSITION}
              className="min-h-screen"
            >
              <ProfilePage />
            </motion.div>
          </PrivateRoute>
        } />
        <Route path="/billing" element={
          <PrivateRoute>
            <motion.div
              {...PAGE_TRANSITION}
              className="min-h-screen"
            >
              <BillingPage />
            </motion.div>
          </PrivateRoute>
        } />
        <Route path="/usage" element={
          <PrivateRoute>
            <motion.div
              {...PAGE_TRANSITION}
              className="min-h-screen"
            >
              <UsagePage />
            </motion.div>
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <motion.div
              {...PAGE_TRANSITION}
              className="min-h-screen"
            >
              <SettingsPage />
            </motion.div>
          </PrivateRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;