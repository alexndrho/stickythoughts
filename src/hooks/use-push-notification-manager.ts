'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { authClient } from '@/lib/auth-client';
import { subscribePush } from '@/utils/push';
import { getUserSettingsNotifications } from '@/services/user';
import { userKeys } from '@/lib/query-keys/user';

export function usePushNotificationManager() {
  const { data: session } = authClient.useSession();

  const { data: notificationSettings } = useQuery({
    queryKey: userKeys.notificationSettings(),
    queryFn: getUserSettingsNotifications,
    enabled: !!session,
  });

  useEffect(() => {
    if (!session) return;
    if (!notificationSettings?.pushNotificationsEnabled) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    subscribePush().catch(() => {});
  }, [session, notificationSettings?.pushNotificationsEnabled]);
}
