import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getUser,
  getUserComments,
  getUserLikedThreads,
  getUserNewNotificationCount,
  getUserNotifications,
  getUserThreads,
} from "@/services/user";
import { THREAD_COMMENTS_PER_PAGE, THREADS_PER_PAGE } from "@/config/thread";
import { NOTIFICATION_PER_PAGE } from "@/config/user";

export const userOptions = queryOptions({
  queryKey: ["user"],
});

export const userUsernameOptions = (username: string) => {
  return queryOptions({
    queryKey: [...userOptions.queryKey, username],
    queryFn: () => getUser(username),
  });
};

export const userNotificationsInfiniteOptions = infiniteQueryOptions({
  queryKey: [...userOptions.queryKey, "notifications"],
  initialPageParam: undefined,
  queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
    getUserNotifications(pageParam),
  getNextPageParam: (notifications) => {
    if (notifications.length < NOTIFICATION_PER_PAGE) return undefined;
    return notifications[notifications.length - 1].updatedAt;
  },
});

export const userNotificationCountOptions = queryOptions({
  queryKey: [...userOptions.queryKey, "notification-count"],
  queryFn: getUserNewNotificationCount,
});

export const userThreadsInfiniteOptions = (username: string) => {
  return infiniteQueryOptions({
    queryKey: [...userOptions.queryKey, username, "threads"],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
      getUserThreads({
        username,
        lastId: pageParam,
      }),
    getNextPageParam: (posts) => {
      if (posts.length < THREADS_PER_PAGE) return undefined;

      return posts[posts.length - 1].id;
    },
  });
};

export const userCommentsInfiniteOptions = (username: string) => {
  return infiniteQueryOptions({
    queryKey: [...userOptions.queryKey, username, "comments"],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
      getUserComments({
        username,
        lastId: pageParam,
      }),
    getNextPageParam: (posts) => {
      if (posts.length < THREAD_COMMENTS_PER_PAGE) return undefined;
      return posts[posts.length - 1].id;
    },
  });
};

export const userLikedThreadsInfiniteOptions = (username: string) => {
  return infiniteQueryOptions({
    queryKey: [...userOptions.queryKey, username, "likes"],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
      getUserLikedThreads({
        username,
        lastId: pageParam,
      }),
    getNextPageParam: (posts) => {
      if (posts.length < THREADS_PER_PAGE) return undefined;

      return posts[posts.length - 1].id;
    },
  });
};
