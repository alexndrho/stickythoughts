import 'client-only';

import { queryOptions } from '@tanstack/react-query';

import { authClient } from '@/lib/auth-client';
import { userKeys } from '@/lib/query-keys';

export const userSessionsOptions = queryOptions({
  queryKey: userKeys.sessions(),
  queryFn: async () => authClient.listSessions(),
});
