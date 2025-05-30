import { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
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
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Manual refetch function
  const refetch = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const db = getDatabase();
      const statsRef = ref(db, `usage_stats/${user.uid}`);
      const snapshot = await get(statsRef);
      const data = snapshot.val();
      if (data) {
        setStats(data);
      } else {
        const initialStats: UsageStats = {
          totalAnimations: 0,
          remainingAnimations: 5,
          totalRenderTime: 0,
          averageRenderTime: 0,
          lastUpdated: new Date().toISOString(),
          account_type: 'free'
        };
        setStats(initialStats);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

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
            remainingAnimations: 5, // Default to free tier limit
            totalRenderTime: 0,
            averageRenderTime: 0,
            lastUpdated: new Date().toISOString(),
            account_type: 'free'
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

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user]);

  return { stats, loading, error, refetch };
}; 