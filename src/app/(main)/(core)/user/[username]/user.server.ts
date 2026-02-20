import 'server-only';

import { headers as nextHeaders } from 'next/headers';
import { cache } from 'react';

import { auth } from '@/lib/auth';
import type { UserPublicAccount } from '@/types/user';
import { enforceRscRateLimit } from '@/lib/rate-limit/rsc';
import { getUserPublicAccount, UserNotFoundError } from '@/server/user';

export { UserNotFoundError };

async function getUserServerUncached(username: string): Promise<UserPublicAccount> {
  const headers = await nextHeaders();
  const session = await auth.api.getSession({ headers });

  await enforceRscRateLimit({
    tier: 'get:standard',
    userId: session?.user?.id ?? null,
    headers,
  });

  const hasPermissionToBan = session
    ? (
        await auth.api.userHasPermission({
          body: {
            userId: session.user.id,
            permission: {
              user: ['ban'],
            },
          },
        })
      ).success
    : false;

  return await getUserPublicAccount({
    username,
    canSeeBanned: hasPermissionToBan,
  });
}

// Dedup within a single RSC render/request (e.g. `generateMetadata` + page render).
// Request-scoped memoization avoids cross-request leaks of permissioned fields.
export const getUserServer = cache(getUserServerUncached);
