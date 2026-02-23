import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NotificationWithActor } from '@/types/notification.types';

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  logout: () => void;

  // Notifications
  notifications: NotificationWithActor[];
  unreadCount: number;
  addNotification: (notification: NotificationWithActor) => void;
  setNotifications: (notifications: NotificationWithActor[]) => void;
  setUnreadCount: (count: number) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;

  // Socket
  socketConnected: boolean;
  setSocketConnected: (connected: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      token: null,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setToken: (token, refreshToken) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }

        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        } else {
          localStorage.removeItem('refreshToken');
        }

        set({ token });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          notifications: [],
          unreadCount: 0,
        });
      },

      // Notifications
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        })),
      setNotifications: (notifications) =>
        set({ notifications }),
      setUnreadCount: (count) =>
        set({ unreadCount: count }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
          unreadCount: 0,
        })),
      clearNotifications: () =>
        set({
          notifications: [],
          unreadCount: 0,
        }),

      // Socket
      socketConnected: false,
      setSocketConnected: (connected) =>
        set({
          socketConnected: connected,
        }),
    }),
    {
      name: 'gym-study-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
