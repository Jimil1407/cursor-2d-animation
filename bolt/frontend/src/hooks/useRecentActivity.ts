import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

interface Activity {
  id: string;
  name: string;
  date: string;
  duration: string;
  status: string;
}

export const useRecentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const activitiesRef = ref(db, `users/${user.uid}/codes`);

    const unsubscribe = onValue(
      activitiesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Convert object to array and sort by date
          const activityList: Activity[] = Object.entries(data).map(([id, code]: [string, any]) => ({
            id,
            name: code.title || 'Untitled',
            date: code.timestamp || '',
            duration: code.render_time || '0',
            status: code.status || 'completed'
          }));

          // Sort by date descending
          activityList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setActivities(activityList.slice(0, 10)); // Get last 10 activities
        } else {
          setActivities([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching recent activity:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { activities, loading, error };
}; 