import { InfiniteData } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import {
  userNotificationCountOptions,
  userNotificationsInfiniteOptions,
} from "./options";
import { UserNotificationType } from "@/types/user";

export const setUserNotificationOpenedQueryData = () => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<number>(
    userNotificationCountOptions.queryKey,
    (oldCount) => (oldCount ? 0 : oldCount),
  );
};

export const setMarkReadNotificationQueryData = ({
  id,
  isRead,
}: {
  id: string;
  isRead: boolean;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<UserNotificationType[]>>(
    userNotificationsInfiniteOptions.queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.map((notification) =>
            notification.id === id
              ? ({
                  ...notification,
                  isRead,
                } satisfies UserNotificationType)
              : notification,
          ),
        ),
      };
    },
  );
};

export const setDeleteNotificationQueryData = ({ id }: { id: string }) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<UserNotificationType[]>>(
    userNotificationsInfiniteOptions.queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.filter((notification) => notification.id !== id),
        ),
      };
    },
  );
};
