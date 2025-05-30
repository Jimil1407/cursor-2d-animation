import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import BackButton from '../components/BackButton';
import { getAuth } from 'firebase/auth';
import { useSearchParams } from 'react-router-dom';
import { createRazorpayOrder } from '../services/api';
import toast from 'react-hot-toast';
import { auth } from '../services/firebase';
import { api } from '../services/api';
import { PaymentResultModal } from '../components/PaymentResultModal';
import { useAuth } from '../context/AuthContext';
import { useUsageStats } from '../hooks/useUsageStats';
import { DowngradeConfirmationModal } from '../components/DowngradeConfirmationModal';

const BillingPage: React.FC = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [subscriptionStatus, setSubscriptionStatus] = useState<'success' | 'canceled' | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const { user } = useAuth();
  const { refetch, stats } = useUsageStats();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      setSubscriptionStatus('success');
    } else if (canceled === 'true') {
      setSubscriptionStatus('canceled');
    }
  }, [searchParams]);

  // Get current plan from stats
  const currentPlan = stats?.account_type?.toLowerCase() || 'free';

  // Plans data with dynamic current plan
  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: [
        '5 generations per day',
        'Basic templates',
        '720p video quality',
      ],
      current: currentPlan === 'free',
    },
    {
      name: 'Plus',
      price: '$5',
      features: [
        '25 generations per day',
        'All templates',
        '1080p video quality',
        'Priority support',
      ],
      current: currentPlan === 'plus',
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
      current: currentPlan === 'pro',
    },
  ];

  // Plan order for comparison
  const planOrder = ['free', 'plus', 'pro'];

  const refreshSubscription = async () => {
    // Refetch usage stats after successful payment
    await refetch();
    setModalOpen(false);
  };

  const onPlanClick = (plan: string) => {
    if (plan === currentPlan) return;
    // If downgrading (current plan is higher in order than selected)
    if (planOrder.indexOf(currentPlan) > planOrder.indexOf(plan)) {
      setPendingPlan(plan);
      setShowDowngradeModal(true);
    } else {
      handleSubscribe(plan);
    }
  };

  const handleSubscribe = async (plan: string) => {
    try {
      setLoadingPlan(plan);
      const user = auth.currentUser;
      if (plan === 'free') {
        // Downgrade to free without payment
        await api.post('/api/downgrade-to-free', { uid: user?.uid });
        setModalSuccess(true);
        setModalMessage('You have been downgraded to the Free plan.');
        setModalOpen(true);
        setLoadingPlan(null);
        return;
      }
      const data = await createRazorpayOrder(plan);
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: 'PromptMotion',
        description: `Subscribe to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        handler: async function (response: any) {
          setLoadingPlan(plan); // Show spinner
          try {
            const verifyRes = await api.post('/api/verify-razorpay-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              uid: user?.uid,
              plan,
            });
            if (verifyRes.data.success) {
              setModalSuccess(true);
              setModalMessage('Subscription activated! Enjoy your new plan.');
              setModalOpen(true);
            } else {
              setModalSuccess(false);
              setModalMessage('Payment failed: ' + (verifyRes.data.reason || 'Unknown error'));
              setModalOpen(true);
            }
          } catch (err) {
            setModalSuccess(false);
            setModalMessage('Verification failed. Please contact support.');
            setModalOpen(true);
          } finally {
            setLoadingPlan(null);
          }
        },
        prefill: {},
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setModalSuccess(false);
      setModalMessage('Error creating Razorpay order.');
      setModalOpen(true);
      setLoadingPlan(null);
    }
  };

  // Downgrade modal message logic
  let downgradeMessage = '';
  if (pendingPlan) {
    if (currentPlan === 'pro' && pendingPlan === 'plus') {
      downgradeMessage = 'You are downgrading from Pro to Plus. No refund will be initiated for the downgrade. Are you sure you want to continue?';
    } else if (planOrder.indexOf(currentPlan) > planOrder.indexOf(pendingPlan)) {
      downgradeMessage = `You are downgrading your plan from ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} to ${pendingPlan.charAt(0).toUpperCase() + pendingPlan.slice(1)}. Are you sure you want to continue?`;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 md:py-12">
        <BackButton />
        
        {subscriptionStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8 p-3 md:p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm md:text-base"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="text-green-700 dark:text-green-300">
                Subscription successful! Thank you for your purchase.
              </p>
            </div>
          </motion.div>
        )}

        {subscriptionStatus === 'canceled' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8 p-3 md:p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-sm md:text-base"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <p className="text-yellow-700 dark:text-yellow-300">
                Subscription was canceled. You can try again whenever you're ready.
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 md:mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Select the perfect plan for your needs. All plans include our core features
            with different usage limits and additional benefits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full ${
                plan.current ? 'ring-2 ring-purple-600' : ''
              }`}
            >
              <div className="p-4 md:p-8 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h2>
                  {plan.current && (
                    <span className="px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      Current Plan
                    </span>
                  )}
                </div>
                <div className="mb-4 md:mb-6">
                  <span className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">/month</span>
                  )}
                </div>
                <ul className="space-y-2 md:space-y-4 mb-6 md:mb-8 text-sm md:text-base">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 md:gap-3">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2 md:py-3 px-4 rounded-lg font-medium transition-colors mt-auto ${
                    plan.current
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  disabled={plan.current || loadingPlan !== null}
                  onClick={() => !plan.current && onPlanClick(plan.name.toLowerCase())}
                >
                  {loadingPlan === plan.name.toLowerCase() ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : plan.current ? (
                    'Current Plan'
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <PaymentResultModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        success={modalSuccess}
        message={modalMessage}
        buttonText={modalSuccess ? 'Go to Dashboard' : 'Try Again'}
        onButtonClick={modalSuccess ? refreshSubscription : () => setModalOpen(false)}
      />
      <DowngradeConfirmationModal
        isOpen={showDowngradeModal}
        onClose={() => setShowDowngradeModal(false)}
        onConfirm={() => {
          setShowDowngradeModal(false);
          if (pendingPlan) handleSubscribe(pendingPlan);
        }}
        message={downgradeMessage}
        confirmText="Confirm Downgrade"
        cancelText="Cancel"
      />
    </div>
  );
};

export default BillingPage; 