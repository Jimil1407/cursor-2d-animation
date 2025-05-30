import React from 'react';
import BackButton from '../components/BackButton';

const TermsOfServicePage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BackButton />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="mb-4">Last updated: June 2024</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">1. Acceptance of Terms</h2>
        <p className="mb-4">By using PromptMotion, you agree to these Terms of Service. If you do not agree, please do not use our platform.</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">2. User Responsibilities</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide accurate account information and keep it updated.</li>
          <li>Maintain the confidentiality of your login credentials.</li>
          <li>Comply with all applicable laws and regulations.</li>
        </ul>
        <h2 className="text-2xl font-bold mt-6 mb-2">3. Acceptable Use</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Do not use the service for unlawful, harmful, or abusive purposes.</li>
          <li>Do not attempt to reverse engineer or disrupt the platform.</li>
          <li>Respect the rights of other users and third parties.</li>
        </ul>
        <h2 className="text-2xl font-bold mt-6 mb-2">4. Payment & Subscriptions</h2>
        <p className="mb-4">Access to certain features requires a paid subscription. Payments are processed securely via Razorpay. No refunds are provided for partial use or downgrades.</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">5. Intellectual Property</h2>
        <p className="mb-4">All content, trademarks, and technology on PromptMotion are owned by us or our licensors. You retain rights to your own generated animations, subject to these terms.</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">6. Termination</h2>
        <p className="mb-4">We may suspend or terminate your access for violations of these terms or misuse of the platform.</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">7. Disclaimers & Limitation of Liability</h2>
        <p className="mb-4">PromptMotion is provided "as is" without warranties. We are not liable for any damages arising from your use of the platform.</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">8. Changes to Terms</h2>
        <p className="mb-4">We may update these Terms of Service at any time. Continued use of the platform constitutes acceptance of the new terms.</p>
        <h2 className="text-2xl font-bold mt-6 mb-2">9. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:contact@promptmotion.com" className="text-indigo-600 hover:text-indigo-500">contact@promptmotion.com</a>.</p>
      </div>
    </main>
  </div>
);

export default TermsOfServicePage; 