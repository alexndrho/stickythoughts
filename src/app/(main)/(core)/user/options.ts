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

export const userNotificationsOptions = queryOptions({
  queryKey: [...userOptions.queryKey, "notifications"],
});

export const userNotificationsInfiniteOptions = infiniteQueryOptions({
  queryKey: [...userNotificationsOptions.queryKey, "infiniteNotifications"],
  initialPageParam: undefined,
  queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
    getUserNotifications(pageParam),
  getNextPageParam: (notifications) => {
    if (notifications.length < NOTIFICATION_PER_PAGE) return undefined;
    return notifications[notifications.length - 1].updatedAt;
  },
});

export const userNotificationCountOptions = queryOptions({
  queryKey: [...userNotificationsOptions.queryKey, "count"],
  queryFn: getUserNewNotificationCount,
});

export const userUsernameThreadsInfiniteOptions = (username: string) => {
  return infiniteQueryOptions({
    queryKey: [...userUsernameOptions(username).queryKey, "infiniteThreads"],
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

export const userUsernameCommentsInfiniteOptions = (username: string) => {
  return infiniteQueryOptions({
    queryKey: [...userUsernameOptions(username).queryKey, "infiniteComments"],
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

export const userUsernameLikedThreadsInfiniteOptions = (username: string) => {
  return infiniteQueryOptions({
    queryKey: [...userUsernameOptions(username).queryKey, "infiniteLikes"],
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
