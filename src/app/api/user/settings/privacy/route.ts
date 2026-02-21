import { NextResponse } from 'next/server';

import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse } from '@/lib/http/api-responses';
import { getUserPrivacySettings } from '@/server/user/user';
import type { UserSettingsPrivacyDTO } from '@/types/user';

export async function GET(request: Request) {
  try {
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const privacySettings = await getUserPrivacySettings({
      userId: session.user.id,
    });

    return NextResponse.json((privacySettings ?? null) satisfies UserSettingsPrivacyDTO, {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
