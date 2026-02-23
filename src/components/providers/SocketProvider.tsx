'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useStore } from '@/store';
import { notificationsApi } from '@/lib/api/notifications.api';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocket();

  const { isAuthenticated, setUnreadCount } = useStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    notificationsApi.getUnreadCount().then(setUnreadCount).catch(() => {});
  }, [isAuthenticated, setUnreadCount]);

  return <>{children}</>;
}
