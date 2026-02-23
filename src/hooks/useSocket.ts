'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '@/store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated, addNotification, setSocketConnected } = useStore();

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // XP events
    socket.on('xp:gained', (data) => {
      window.dispatchEvent(new CustomEvent('xp:gained', { detail: data }));
    });

    socket.on('xp:level_up', (data) => {
      window.dispatchEvent(new CustomEvent('xp:level_up', { detail: data }));
    });

    // Streak events
    socket.on('streak:milestone', (data) => {
      window.dispatchEvent(new CustomEvent('streak:milestone', { detail: data }));
    });

    socket.on('streak:freeze_used', (data) => {
      window.dispatchEvent(new CustomEvent('streak:freeze_used', { detail: data }));
    });

    // Quest events
    socket.on('quest:completed', (data) => {
      window.dispatchEvent(new CustomEvent('quest:completed', { detail: data }));
    });

    socket.on('quest:claimed', (data) => {
      window.dispatchEvent(new CustomEvent('quest:claimed', { detail: data }));
    });

    // Gems events
    socket.on('gems:earned', (data) => {
      window.dispatchEvent(new CustomEvent('gems:earned', { detail: data }));
    });

    socket.on('gems:spent', (data) => {
      window.dispatchEvent(new CustomEvent('gems:spent', { detail: data }));
    });

    // Group events
    socket.on('group:message', (data) => {
      window.dispatchEvent(new CustomEvent('group:message', { detail: data }));
    });

    // Notification events
    socket.on('notification:new', (data) => {
      addNotification({
        id: data.id,
        user_id: '',
        actor_id: data.actor_id || null,
        type: data.type,
        title: data.title,
        body: data.body || null,
        data: data.data || {},
        reference_type: data.reference_type || null,
        reference_id: data.reference_id || null,
        is_read: false,
        read_at: null,
        expires_at: null,
        created_at: data.created_at || new Date().toISOString(),
        actor_username: null,
        actor_avatar_url: null,
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [isAuthenticated, addNotification, setSocketConnected]);

  return socketRef;
}
