import React from 'react';
import BackButton from '../components/BackButton';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4">About Us</h1>
          <p className="text-lg mb-4">
            Welcome to PromptMotion, your AI-powered animation studio. We are dedicated to making 2D animation accessible and fun for everyone.
          </p>
          <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
          <p className="text-lg mb-4">
            Our mission is to empower creators with the tools they need to bring their ideas to life through animation.
          </p>
          <h2 className="text-2xl font-bold mb-2">Our Team</h2>
          <p className="text-lg">
            We are a passionate team of developers and designers committed to innovation and excellence in animation technology.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutPage; 