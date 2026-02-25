'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { notifications } from '@mantine/notifications';
import {
  ActionIcon,
  Anchor,
  Center,
  Flex,
  Indicator,
  Loader,
  Menu,
  ScrollArea,
  Text,
} from '@mantine/core';
import { IconDots, IconMessageDots, IconTrash, IconX } from '@tabler/icons-react';

import { type authClient } from '@/lib/auth-client';
import {
  userNotificationCountOptions,
  userNotificationsInfiniteOptions,
} from '@/app/(main)/(core)/user/options';
import {
  setDeleteNotificationQueryData,
  setMarkReadNotificationQueryData,
  setUserNotificationOpenedQueryData,
} from '@/app/(main)/(core)/user/set-query-data';
import {
  deleteUserNotification,
  userNotificationMarkRead,
  userNotificationOpened,
} from '@/services/user';
import InfiniteScroll from './infinite-scroll';
import classes from '@/styles/user-notification.module.css';
import AuthorAvatar from './author-avatar';
import type { UserNotification } from '@/types/user';

export interface UserNotificationProps {
  children: React.ReactElement;
  session: NonNullable<ReturnType<typeof authClient.useSession>['data']>;
}

export default function UserNotification({ children, session }: UserNotificationProps) {
  const [opened, setOpened] = useState(false);

  const {
    data: notifications,
    isFetching: isFetchingNotifications,
    fetchNextPage: fetchNextNotificationsPage,
    hasNextPage: hasNextNotificationsPage,
  } = useInfiniteQuery({
    ...userNotificationsInfiniteOptions,
    enabled: !!session,
  });

  const { data: newNotificationCount } = useQuery({
    ...userNotificationCountOptions,
    enabled: !!session,
  });

  const notificationOpenedMutation = useMutation({
    mutationFn: userNotificationOpened,
    onSuccess: () => {
      setUserNotificationOpenedQueryData();
    },
  });

  const onChange = (opened: boolean) => {
    setOpened(opened);

    if (opened && newNotificationCount && newNotificationCount > 0) {
      notificationOpenedMutation.mutate(undefined);
    }
  };

  return (
    <Menu opened={opened} onChange={onChange}>
      <Menu.Target>
        <Indicator
          label={newNotificationCount && newNotificationCount > 99 ? '99+' : newNotificationCount}
          color="red"
          inline
          size={16}
          disabled={!newNotificationCount || newNotificationCount === 0}
        >
          {children}
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown className={classes.notification}>
        <ScrollArea.Autosize mah={400}>
          <InfiniteScroll
            onLoadMore={fetchNextNotificationsPage}
            hasNext={hasNextNotificationsPage}
            loading={isFetchingNotifications}
          >
            <Text fz="h4" className={classes.notification__title}>
              Notifications
            </Text>

            {notifications &&
              notifications.pages[0].length !== 0 &&
              notifications.pages
                .reduce((acc, page) => acc.concat(page))
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    setClosed={() => setOpened(false)}
                  />
                ))}

            {isFetchingNotifications ? (
              <Center p="md">
                <Loader />
              </Center>
            ) : (
              (!notifications || notifications.pages[0].length === 0) && (
                <Center p="md">No notifications</Center>
              )
            )}
          </InfiniteScroll>
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}

function NotificationItem({
  notification,
  setClosed,
}: {
  notification: UserNotification;
  setClosed: () => void;
}) {
  const markReadMutation = useMutation({
    mutationFn: async (isRead: boolean) => {
      await userNotificationMarkRead({
        id: notification.id,
        body: { isRead },
      });

      return { id: notification.id, isRead };
    },
    onSuccess: (data) => {
      setMarkReadNotificationQueryData({
        id: data.id,
        isRead: data.isRead,
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: `Failed to mark notification as ${notification.isRead ? 'unread' : 'read'}.`,
        color: 'red',
        icon: <IconX size="1em" />,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await deleteUserNotification(notification.id);

      return { id: notification.id };
    },
    onSuccess: (data) => {
      setDeleteNotificationQueryData({
        id: data.id,
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete notification.',
        color: 'red',
        icon: <IconX size="1em" />,
      });
    },
  });

  const link =
    notification.type === 'LETTER_LIKE'
      ? `/letters/${notification.letterId}`
      : notification.type === 'LETTER_REPLY_LIKE'
        ? `/letters/${notification.letterId}`
        : notification.type === 'LETTER_REPLY'
          ? `/letters/${notification.letterId}`
          : notification.type === 'LETTER_PENDING_REVIEW'
            ? '/dashboard/submissions'
            : '#';

  return (
    <div
      key={notification.id}
      className={`${classes['notification-item']} ${
        !notification.isRead ? classes['notification-item--unread'] : ''
      }`}
    >
      <Link
        aria-label="View Letter"
        href={link}
        onClick={() => {
          setClosed();
          markReadMutation.mutate(true);
        }}
        className={classes['notification-item__link']}
      />

      <div className={classes['notification-item__content']}>
        <Flex gap="sm">
          {notification.mainActor.isAnonymous ? (
            <AuthorAvatar isAnonymous={true} className={classes['notification-item__avatar']} />
          ) : (
            <AuthorAvatar
              component={Link}
              src={notification.mainActor.image}
              href={`/user/${notification.mainActor.username}`}
              className={classes['notification-item__avatar']}
              onClick={() => setClosed()}
            />
          )}

          <div>
            <Text size="sm" lineClamp={3}>
              {formatNotificationBody({ notification, setClosed })}
            </Text>
            <Text size="xs">{formatDistanceToNow(notification.updatedAt)}</Text>
          </div>
        </Flex>

        <Menu>
          <Menu.Target>
            <ActionIcon
              variant="transparent"
              onPointerDown={(e) => e.stopPropagation()}
              className={classes['notification-item__more']}
            >
              <IconDots size="1em" />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown onPointerDown={(e) => e.stopPropagation()}>
            <Menu.Item
              leftSection={<IconMessageDots size="1em" />}
              onClick={() => markReadMutation.mutate(!notification.isRead)}
            >
              {notification.isRead ? 'Mark as Unread' : 'Mark as Read'}
            </Menu.Item>

            <Menu.Item
              color="red"
              leftSection={<IconTrash size="1em" />}
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}

function formatNotificationBody({
  notification,
  setClosed,
}: {
  notification: UserNotification;
  setClosed: () => void;
}) {
  const actor = notification.mainActor.isAnonymous ? (
    <Text span inherit className={classes['notification-item__actor-link']}>
      Anonymous
    </Text>
  ) : (
    <Anchor
      component={Link}
      inherit
      href={`/user/${notification.mainActor.username}`}
      onClick={() => setClosed()}
      className={classes['notification-item__actor-link']}
    >
      {notification.mainActor.name || notification.mainActor.username}
    </Anchor>
  );

  const others =
    notification.otherActorCount && notification.otherActorCount > 0 ? (
      <>
        {' and '}
        <Text span inherit className={classes['notification-item__other-actor']}>
          {notification.otherActorCount} other
          {notification.otherActorCount > 1 ? 's' : ''}
        </Text>
      </>
    ) : null;

  switch (notification.type) {
    case 'LETTER_LIKE':
      return (
        <>
          {actor}
          {others}
          {' liked your letter: '}
          {notification.body}
        </>
      );
    case 'LETTER_REPLY_LIKE':
      return (
        <>
          {actor}
          {others}
          {' liked your reply: '}
          {notification.body}
        </>
      );
    case 'LETTER_REPLY':
      return (
        <>
          {actor}
          {' replied to your letter: '}
          {notification.body}
        </>
      );
    case 'LETTER_PENDING_REVIEW':
      return (
        <>
          <Text span inherit fw={600}>
            New pending letter
          </Text>
          {notification.body ? `: ${notification.body}` : ''}
        </>
      );
    default:
      return null;
  }
}
