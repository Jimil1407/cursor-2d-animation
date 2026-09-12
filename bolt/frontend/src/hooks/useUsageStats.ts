import { useCallback, useEffect, useState } from 'react';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { UsageStats } from '../types';

const EMPTY_STATS: UsageStats = {
  totalAnimations: 0,
  remainingAnimations: 5,
  totalRenderTime: 0,
  averageRenderTime: 0,
  lastUpdated: new Date().toISOString(),
  account_type: 'free',
  limit: 5,
};

export const useUsageStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snapshot = await get(ref(getDatabase(), `usage_stats/${user.uid}`));
      setStats(snapshot.val() ?? EMPTY_STATS);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage stats');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    // Live subscription: the backend writes totals as renders complete.
    return onValue(
      ref(getDatabase(), `usage_stats/${user.uid}`),
      (snapshot) => {
        setStats(snapshot.val() ?? EMPTY_STATS);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching usage stats:', err);
        setError(err.message);
        setLoading(false);
      }
    );
  }, [user]);

  return { stats, loading, error, refetch };
};
