import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLogin = useLocation().pathname === '/login';
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900">
      {!isLogin && <Header />}
      <main className="w-full h-full">{children}</main>
      <Toaster position="top-right" />
    </div>
  );
};

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ duration: 0.35, ease: 'easeInOut' }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

const PUBLIC_ROUTES = [
  { path: '/login', element: <LoginPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/privacy', element: <PrivacyPolicyPage /> },
  { path: '/terms', element: <TermsOfServicePage /> },
];

const PRIVATE_ROUTES = [
  { path: '/', element: <HomePage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/billing', element: <BillingPage /> },
  { path: '/usage', element: <UsagePage /> },
  { path: '/settings', element: <SettingsPage /> },
];

const AppRoutes: React.FC = () => {
  const location = useLocation();
  return (
    // Keyed by pathname so the exit animation runs once per navigation rather
    // than on every history entry (location.key changes on replace/refresh too).
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {PUBLIC_ROUTES.map(({ path, element }) => (
          <Route key={path} path={path} element={<Page>{element}</Page>} />
        ))}
        {PRIVATE_ROUTES.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                <Page>{element}</Page>
              </ProtectedRoute>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => (
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

export default App;
