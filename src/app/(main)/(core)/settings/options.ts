import 'client-only';

import { queryOptions } from '@tanstack/react-query';

import { authClient } from '@/lib/auth-client';
import { getUserAccountSettings } from '@/services/user';
import { userKeys } from '@/lib/query-keys';

export const userAccountOptions = queryOptions({
  queryKey: userKeys.account(),
  queryFn: getUserAccountSettings,
});

export const userAccountListOptions = queryOptions({
  queryKey: userKeys.accountList(),
  queryFn: () => authClient.listAccounts(),
});
