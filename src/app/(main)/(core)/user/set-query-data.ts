import { InfiniteData } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/get-query-client';
import { userKeys } from '@/lib/query-keys/user';
import { UserNotification } from '@/types/user';

export const setUserNotificationOpenedQueryData = () => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<number>(userKeys.notificationCount(), (oldCount) =>
    oldCount ? 0 : oldCount,
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

  queryClient.setQueryData<InfiniteData<UserNotification[]>>(
    userKeys.notificationsInfinite(),
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
                } satisfies UserNotification)
              : notification,
          ),
        ),
      };
    },
  );
};

export const setDeleteNotificationQueryData = ({ id }: { id: string }) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<UserNotification[]>>(
    userKeys.notificationsInfinite(),
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => page.filter((notification) => notification.id !== id)),
      };
    },
  );
};
