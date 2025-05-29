import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import BackButton from '../components/BackButton';
import { getAuth } from 'firebase/auth';

const BillingPage: React.FC = () => {
  // Mock data - replace with actual data from your backend
  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: [
        '5 generations per day',
        'Basic templates',
        '720p video quality',
      ],
      current: true,
    },
    {
      name: 'Plus',
      price: '$5',
      features: [
        '25 generations per day',
        'All templates',
        '4K video quality',
        'Priority support',
      ],
      current: false,
    },
    {
      name: 'Pro',
      price: '$12',
      features: [
        '60 generations per day',
        'All templates',
        '4K video quality',
        'Priority support',
        'Early access to new features',
      ],
      current: false,
    },
  ];

  const handleSubscribe = async (plan: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ plan, uid: user.uid }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include our core features
            with different usage limits and additional benefits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
                plan.current ? 'ring-2 ring-purple-600' : ''
              }`}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h2>
                  {plan.current && (
                    <span className="px-3 py-1 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      Current Plan
                    </span>
                  )}
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.current
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  disabled={plan.current}
                  onClick={() => !plan.current && handleSubscribe(plan.name.toLowerCase())}
                >
                  {plan.current ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Payment Methods
          </h2>
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <CreditCard className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No payment method added
              </h3>
              <p className="text-gray-900 dark:text-white">
                Add a payment method to upgrade your plan
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BillingPage; 