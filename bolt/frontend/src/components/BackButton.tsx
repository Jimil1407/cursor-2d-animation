import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/')}
      className="flex items-center gap-2 px-4 py-2 mb-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back to Home</span>
    </button>
  );
};

export default BackButton; 