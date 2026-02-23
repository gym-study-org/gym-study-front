import apiClient from './client';
import { NotificationWithActor, NotificationQuery } from '@/types/notification.types';

interface NotificationsResponse {
  notifications: NotificationWithActor[];
  next_cursor: string | null;
}

export const notificationsApi = {
  getNotifications: async (query?: NotificationQuery): Promise<NotificationsResponse> => {
    const params = new URLSearchParams();
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.cursor) params.set('cursor', query.cursor);
    if (query?.unread_only) params.set('unread_only', 'true');
    const response = await apiClient.get<{ data: NotificationsResponse }>(
      `/notifications?${params.toString()}`
    );
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ data: { unread_count: number } }>(
      '/notifications/unread-count'
    );
    return response.data.data.unread_count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },
};
