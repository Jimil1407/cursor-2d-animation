  <div className="flex flex-col justify-center w-full lg:w-1/2 px-4 sm:px-8 md:px-16 lg:px-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto w-full bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 backdrop-blur-lg border border-white/30 dark:border-gray-800/40"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10 text-gray-900 dark:text-white tracking-tight">
        {isSignUp ? "Create an Account" : "Welcome Back"}
      </h2>

      <div className="text-center mb-4 sm:mb-6">
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {isSignUp ? "Sign up for a new account" : "Sign in to continue to your account"}
        </p>
      </div>
      <form onSubmit={handleEmailAuth} className="space-y-6 sm:space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg text-sm sm:text-base"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-sm hover:shadow-md focus:shadow-lg text-sm sm:text-base"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 sm:gap-3 rounded-lg bg-purple-600 px-4 sm:px-6 py-2 sm:py-3 text-white font-semibold hover:bg-purple-700 active:scale-95 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
          {isSignUp ? "Sign Up with Email" : "Sign In with Email"}
        </button>
      </form>
    </motion.div>
  </div> 