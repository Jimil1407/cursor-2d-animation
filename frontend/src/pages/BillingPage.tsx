  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
    <BackButton />
    
    {subscriptionStatus === 'success' && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8 p-3 md:p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-sm md:text-base"
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
        className="mb-4 sm:mb-6 md:mb-8 p-3 md:p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-sm md:text-base"
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
      className="text-center mb-6 sm:mb-8 md:mb-12"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
        Choose Your Plan
      </h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-4">
        Select the perfect plan for your needs. All plans include our core features
        with different usage limits and additional benefits.
      </p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
          <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {plan.name}
              </h2>
              {plan.current && (
                <span className="px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  Current Plan
                </span>
              )}
            </div>
            <div className="mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {plan.price}
              </span>
              {plan.price !== 'Custom' && (
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">/month</span>
              )}
            </div>
            <ul className="space-y-2 sm:space-y-3 md:space-y-4 mb-6 sm:mb-8 text-sm sm:text-base">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors mt-auto text-sm sm:text-base ${
                plan.current
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              disabled={plan.current || loadingPlan !== null}
              onClick={() => !plan.current && onPlanClick(plan.name.toLowerCase())}
            >
              {loadingPlan === plan.name.toLowerCase() ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
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