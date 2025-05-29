import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

interface UsageStats {
  totalAnimations: number;
  remainingAnimations: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastUpdated: string;
  account_type?: string;
  limit?: number;
}

export const useUsageStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const statsRef = ref(db, `usage_stats/${user.uid}`);

    const unsubscribe = onValue(
      statsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStats(data);
        } else {
          // Initialize stats if they don't exist
          const initialStats: UsageStats = {
            totalAnimations: 0,
            remainingAnimations: 20,
            totalRenderTime: 0,
            averageRenderTime: 0,
            lastUpdated: new Date().toISOString(),
          };
          setStats(initialStats);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching usage stats:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { stats, loading, error };
}; 