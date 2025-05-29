import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="h-24 w-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.email?.split('@')[0]}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email Address
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member Since
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {user?.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage; 