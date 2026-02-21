import 'client-only';

import { queryOptions } from '@tanstack/react-query';

import { getUserSettingsPrivacy } from '@/services/user';
import { userKeys } from '@/lib/query-keys/user';

export const userSettingsPrivacy = queryOptions({
  queryKey: userKeys.privacy(),
  queryFn: getUserSettingsPrivacy,
});
