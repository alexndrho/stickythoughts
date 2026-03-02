'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Divider, Skeleton, Switch, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';

import { authClient } from '@/lib/auth-client';
import { subscribePush, unsubscribePush } from '@/utils/push';
import { updateUserSettingsNotifications } from '@/services/user';
import { userSettingsNotificationsOptions } from './options';
import classes from '../settings.module.css';

export default function Content() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: currentSession, isPending: isCurrentSessionPending } = authClient.useSession();

  const [isPushSupported] = useState(
    () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window,
  );
  const [permissionState, setPermissionState] = useState<NotificationPermission | null>(() => {
    if (typeof window === 'undefined') return null;
    if (!('serviceWorker' in navigator && 'PushManager' in window)) return null;
    return Notification.permission;
  });

  useEffect(() => {
    if (!isCurrentSessionPending && !currentSession) {
      router.push('/');
    }
  }, [isCurrentSessionPending, currentSession, router]);

  const { data: settings, isFetching } = useQuery(userSettingsNotificationsOptions);

  const toggleMutation = useMutation({
    mutationFn: async (enable: boolean) => {
      if (enable) {
        let currentPermission = permissionState;

        if (currentPermission === 'default') {
          currentPermission = await Notification.requestPermission();
          setPermissionState(currentPermission);
        }

        if (currentPermission !== 'granted') {
          throw new Error('permission-denied');
        }

        await subscribePush();
      } else {
        await unsubscribePush().catch(() => {});
      }

      await updateUserSettingsNotifications({ pushNotificationsEnabled: enable });
      return enable;
    },
    onSuccess: (enable) => {
      queryClient.setQueryData(userSettingsNotificationsOptions.queryKey, {
        pushNotificationsEnabled: enable,
      });
    },
    onError: (error: Error) => {
      if (error.message !== 'permission-denied') {
        notifications.show({
          title: 'Error',
          message: 'Failed to update notification settings.',
          color: 'red',
        });
      }
    },
  });

  return (
    <div className={classes.container}>
      <Title size="h2" className={classes.title}>
        Notifications
      </Title>

      <Divider mb="md" />

      <Title order={2} size="h3">
        Push Notifications
      </Title>

      {!isPushSupported && permissionState === null && (
        <Alert icon={<IconAlertCircle size="1em" />} color="yellow" mt="md">
          Push notifications are not supported in this browser.
        </Alert>
      )}

      {isPushSupported && permissionState === 'denied' && (
        <Alert icon={<IconAlertCircle size="1em" />} color="orange" mt="md">
          Notification permission is blocked. Enable notifications in your browser settings to use
          this feature.
        </Alert>
      )}

      {isPushSupported && (
        <>
          <Text size="md" mt="xs" className={classes.description}>
            Receive push notifications for new letters, replies, and likes even when the app is
            closed.
          </Text>

          <Skeleton display="inline-block" mt="sm" w="auto" visible={isFetching}>
            <Switch
              label="Enable push notifications"
              checked={settings?.pushNotificationsEnabled ?? false}
              disabled={
                permissionState === 'denied' || permissionState === null || toggleMutation.isPending
              }
              onChange={(event) => toggleMutation.mutate(event.currentTarget.checked)}
            />
          </Skeleton>
        </>
      )}
    </div>
  );
}
