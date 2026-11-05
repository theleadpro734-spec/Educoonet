import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface UnreadNotificationsScope {
  userId: string | null | undefined;
  userEmail: string | null | undefined;
  isLocal: boolean;
}

export function useUnreadNotifications({ userId, userEmail, isLocal }: UnreadNotificationsScope) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (isLocal ? !userEmail : !userId) {
      setCount(0);
      return;
    }
    const base = supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('read', false);
    const { count: unread, error } = isLocal
      ? await base.eq('user_email', userEmail)
      : await base.eq('user_id', userId);
    if (!error) setCount(unread ?? 0);
  }, [userId, userEmail, isLocal]);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel(`unread_notifications_${userId ?? userEmail ?? 'anon'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        void refresh();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refresh, userId, userEmail]);

  return count;
}
