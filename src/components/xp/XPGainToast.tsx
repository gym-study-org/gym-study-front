'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';
import { toast } from 'sonner';
import { XP_SOURCE_LABELS } from '@/types/xp.types';

/**
 * Component that listens for XP WebSocket events and shows toast notifications.
 * Should be mounted once in the dashboard layout.
 */
export function XPGainListener() {
  const { socketConnected } = useStore();

  useEffect(() => {
    // The useSocket hook handles the WebSocket connection.
    // We listen for custom events dispatched by the socket handler.
    const handleXPGain = (event: CustomEvent) => {
      const { amount, source, leveled_up, new_level } = event.detail;
      const sourceLabel = XP_SOURCE_LABELS[source] || source;

      toast.success(`+${amount} XP`, {
        description: sourceLabel,
        duration: 3000,
      });

      if (leveled_up) {
        setTimeout(() => {
          toast.success(`Nível ${new_level}!`, {
            description: 'Parabéns! Você subiu de nível!',
            duration: 5000,
          });
        }, 500);
      }
    };

    window.addEventListener('xp:gained', handleXPGain as EventListener);
    return () => {
      window.removeEventListener('xp:gained', handleXPGain as EventListener);
    };
  }, [socketConnected]);

  return null;
}
