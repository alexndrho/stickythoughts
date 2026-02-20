import { NextResponse } from 'next/server';

import { guardSession } from '@/lib/session-guard';
import { jsonError, unknownErrorResponse } from '@/lib/http';
import { getUserAccountSettings } from '@/server/user';
import { UserNotFoundError } from '@/server/user';
import type { UserAccountSettingsDTO } from '@/types/user';

export async function GET(request: Request) {
  const session = await guardSession({ headers: request.headers });

  if (session instanceof NextResponse) {
    return session;
  }

  try {
    const userSettings: UserAccountSettingsDTO = await getUserAccountSettings({
      userId: session.user.id,
    });

    return NextResponse.json(userSettings);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return jsonError([{ code: 'not-found', message: 'User not found' }], 404);
    }

    console.error('Error fetching user:', error);
    return unknownErrorResponse('Unknown error');
  }
}
