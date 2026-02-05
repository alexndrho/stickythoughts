import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import {
  getUser,
  getUserReplies,
  getUserLikedLetters,
  getUserNewNotificationCount,
  getUserNotifications,
  getUserLetters,
} from "@/services/user";
import { LETTER_REPLIES_PER_PAGE, LETTERS_PER_PAGE } from "@/config/letter";
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

export const userUsernameLettersInfiniteOptions = (username: string) => {
  return infiniteQueryOptions({
    queryKey: [...userUsernameOptions(username).queryKey, "infiniteLetters"],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
      getUserLetters({
        username,
        lastId: pageParam,
      }),
    getNextPageParam: (posts) => {
      if (posts.length < LETTERS_PER_PAGE) return undefined;

      return posts[posts.length - 1].id;
    },
  });
};

export const userUsernameRepliesInfiniteOptions = (username: string) => {
  return infiniteQueryOptions({
    queryKey: [...userUsernameOptions(username).queryKey, "infiniteReplies"],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
      getUserReplies({
        username,
        lastId: pageParam,
      }),
    getNextPageParam: (posts) => {
      if (posts.length < LETTER_REPLIES_PER_PAGE) return undefined;
      return posts[posts.length - 1].id;
    },
  });
};

export const userUsernameLikedLettersInfiniteOptions = (username: string) => {
  return infiniteQueryOptions({
    queryKey: [...userUsernameOptions(username).queryKey, "infiniteLikes"],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
      getUserLikedLetters({
        username,
        lastId: pageParam,
      }),
    getNextPageParam: (posts) => {
      if (posts.length < LETTERS_PER_PAGE) return undefined;

      return posts[posts.length - 1].id;
    },
  });
};
