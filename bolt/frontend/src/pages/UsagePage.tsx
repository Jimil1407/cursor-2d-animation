import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Zap, BarChart2 } from 'lucide-react';

const UsagePage: React.FC = () => {
  // Mock data - replace with actual data from your backend
  const usageStats = {
    totalAnimations: 12,
    remainingAnimations: 8,
    totalRenderTime: '2h 15m',
    averageRenderTime: '11m 15s',
  };

  const recentActivity = [
    {
      id: 1,
      name: 'Circle Animation',
      date: '2024-03-15',
      duration: '15m',
      status: 'completed',
    },
    {
      id: 2,
      name: 'Square to Circle',
      date: '2024-03-14',
      duration: '12m',
      status: 'completed',
    },
    {
      id: 3,
      name: 'Complex Transformation',
      date: '2024-03-13',
      duration: '18m',
      status: 'completed',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Usage Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track your animation usage, render times, and remaining quota.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Animations
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.totalAnimations}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Remaining
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.remainingAnimations}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Render Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.totalRenderTime}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <BarChart2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avg. Render Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.averageRenderTime}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Animation
                    </th>
                    <th className="pb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th className="pb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Duration
                    </th>
                    <th className="pb-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <td className="py-4 text-gray-900 dark:text-white">
                        {activity.name}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-400">
                        {activity.date}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-400">
                        {activity.duration}
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 rounded-full">
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UsagePage; 