import React from 'react';
import BackButton from '../components/BackButton';

const PrivacyPolicyPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">Last updated: June 2024</p>
        <p className="mb-4">PromptMotion ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered 2D animation platform.</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">1. Information We Collect</h2>
        <ul className="list-disc pl-6 mb-4">
          <li><b>Account Information:</b> Email address, name, and authentication data via Firebase.</li>
          <li><b>Usage Data:</b> Animation prompts, generated content, and usage statistics.</li>
          <li><b>Payment Data:</b> Billing information processed securely via Razorpay.</li>
        </ul>
        <h2 className="text-2xl font-bold mt-6 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide and improve our animation services.</li>
          <li>To manage your account and subscriptions.</li>
          <li>To communicate updates, support, and billing information.</li>
          <li>To monitor usage and enforce plan limits.</li>
        </ul>
        <h2 className="text-2xl font-bold mt-6 mb-2">3. Third-Party Services</h2>
        <p className="mb-4">We use trusted third-party providers such as Firebase (for authentication and data storage) and Razorpay (for payments). These services have their own privacy policies.</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">4. Data Security</h2>
        <p className="mb-4">We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">5. Your Rights</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Access, update, or delete your personal information via your account settings.</li>
          <li>Contact us to exercise your rights or for any privacy-related questions.</li>
        </ul>
        <h2 className="text-2xl font-bold mt-6 mb-2">6. Changes to This Policy</h2>
        <p className="mb-4">We may update this Privacy Policy from time to time. We will notify you of any significant changes.</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">7. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:contact@promptmotion.com" className="text-indigo-600 hover:text-indigo-500">contact@promptmotion.com</a>.</p>
      </div>
    </main>
  </div>
);

export default PrivacyPolicyPage; 