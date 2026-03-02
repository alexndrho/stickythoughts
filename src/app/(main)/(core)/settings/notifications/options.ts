import 'client-only';

import { queryOptions } from '@tanstack/react-query';

import { getUserSettingsNotifications } from '@/services/user';
import { userKeys } from '@/lib/query-keys/user';

export const userSettingsNotificationsOptions = queryOptions({
  queryKey: userKeys.notificationSettings(),
  queryFn: getUserSettingsNotifications,
});
