'use client';

import { useEffect } from 'react';

import { authClient } from '@/lib/auth-client';
import { subscribePush } from '@/utils/push';

export function usePushNotificationManager() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session) return;
    if (typeof Notification === 'undefined') return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          subscribePush().catch(() => {});
        }
      });
    } else if (Notification.permission === 'granted') {
      subscribePush().catch(() => {});
    }
  }, [session]);
}
