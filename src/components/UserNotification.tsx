"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { notifications } from "@mantine/notifications";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Box,
  Center,
  Flex,
  Indicator,
  Loader,
  Menu,
  ScrollArea,
  Text,
} from "@mantine/core";
import {
  IconDots,
  IconMessageDots,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

import { type authClient } from "@/lib/auth-client";
import {
  userNotificationCountOptions,
  userNotificationsInfiniteOptions,
} from "@/app/(core)/user/options";
import {
  setDeleteNotificationQueryData,
  setMarkReadNotificationQueryData,
  setUserNotificationOpenedQueryData,
} from "@/app/(core)/user/set-query-data";
import { stripHtmlTags } from "@/utils/text";
import {
  deleteUserNotification,
  userNotificationMarkRead,
  userNotificationOpened,
} from "@/services/user";
import InfiniteScroll from "./InfiniteScroll";
import { UserNotificationType } from "@/types/user";
import classes from "@/styles/user-notification.module.css";

export interface UserNotificationProps {
  children: React.ReactElement;
  session: NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
}

export default function UserNotification({
  children,
  session,
}: UserNotificationProps) {
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
      notificationOpenedMutation.mutate();
    }
  };

  return (
    <Menu opened={opened} onChange={onChange}>
      <Menu.Target>
        <Indicator
          label={
            newNotificationCount && newNotificationCount > 99
              ? "99+"
              : newNotificationCount
          }
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
            <Text fz="h4" fw="bold">
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
  notification: UserNotificationType;
  setClosed: () => void;
}) {
  const markReadMutation = useMutation({
    mutationFn: async (isRead: boolean) => {
      await userNotificationMarkRead({ id: notification.id, isRead });

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
        title: "Error",
        message: `Failed to mark notification as ${
          notification.isRead ? "unread" : "read"
        }.`,
        color: "red",
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
        title: "Error",
        message: "Failed to delete notification.",
        color: "red",
        icon: <IconX size="1em" />,
      });
    },
  });

  const link =
    notification.type === "THREAD_LIKE"
      ? `/threads/${notification.threadId}`
      : notification.type === "THREAD_COMMENT_LIKE"
        ? `/threads/${notification.threadId}`
        : notification.type === "THREAD_COMMENT"
          ? `/threads/${notification.threadId}`
          : "#";

  return (
    <Flex
      key={notification.id}
      pos="relative"
      w="full"
      justify="space-between"
      gap="sm"
      bdrs="sm"
      className={`${classes.notification__item} ${
        !notification.isRead ? classes["notification__item--unread"] : ""
      }`}
      p="sm"
    >
      <Link
        aria-label="View Thread"
        href={link}
        onClick={() => {
          setClosed();
          markReadMutation.mutate(true);
        }}
        className={classes.notification__link}
      />

      <Flex gap="sm">
        <Avatar
          component={Link}
          pos="relative"
          src={notification.actorImage}
          href={`/user/${notification.actorUsername}`}
          onClick={() => setClosed()}
        />

        <Box>
          <Text fz="sm" lineClamp={3}>
            {formatNotificationBody({ notification, setClosed })}
          </Text>
          <Text fz="xs">
            {formatDistanceToNow(new Date(notification.updatedAt))}
          </Text>
        </Box>
      </Flex>

      <Menu>
        <Menu.Target>
          <ActionIcon
            variant="transparent"
            pos="relative"
            className={classes.notification__more}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <IconDots size="1em" />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown onPointerDown={(e) => e.stopPropagation()}>
          <Menu.Item
            leftSection={<IconMessageDots size="1em" />}
            onClick={() => markReadMutation.mutate(!notification.isRead)}
          >
            {notification.isRead ? "Mark as Unread" : "Mark as Read"}
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
    </Flex>
  );
}

function formatNotificationBody({
  notification,
  setClosed,
}: {
  notification: UserNotificationType;
  setClosed: () => void;
}) {
  const actor = (
    <Anchor
      component={Link}
      pos="relative"
      fw="bold"
      href={`/user/${notification.actorUsername}`}
      onClick={() => setClosed()}
      className={classes["notification__actor-link"]}
    >
      {notification.actorName || notification.actorUsername}
    </Anchor>
  );

  const others =
    notification.otherActorCount && notification.otherActorCount > 0 ? (
      <>
        {" and "}
        <Text span fw="bold" inherit>
          {notification.otherActorCount} other
          {notification.otherActorCount > 1 ? "s" : ""}
        </Text>
      </>
    ) : null;

  switch (notification.type) {
    case "THREAD_LIKE":
      return (
        <>
          {actor}
          {others}
          {" liked your thread: "}
          {notification.body}
        </>
      );
    case "THREAD_COMMENT_LIKE":
      return (
        <>
          {actor}
          {others}
          {" liked your comment: "}
          {stripHtmlTags(notification.body)}
        </>
      );
    case "THREAD_COMMENT":
      return (
        <>
          {actor}
          {" commented on your thread: "}
          {stripHtmlTags(notification.body)}
        </>
      );
    default:
      return null;
  }
}
