import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import { getUserNotificationSettings, updateUserNotificationSettings } from '@/server/user/user';
import { updateUserNotificationsInput } from '@/lib/validations/user';
import type { UserSettingsNotificationsDTO } from '@/types/user';

export async function GET(request: Request) {
  try {
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const settings = await getUserNotificationSettings({ userId: session.user.id });

    return NextResponse.json(settings satisfies UserSettingsNotificationsDTO, { status: 200 });
  } catch (error) {
    console.error('GET /api/user/settings/notifications error:', error);
    return unknownErrorResponse('Something went wrong');
  }
}

export async function PUT(request: Request) {
  try {
    const body = updateUserNotificationsInput.parse(await request.json());
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    await updateUserNotificationSettings({ userId: session.user.id, ...body });
    const settings = await getUserNotificationSettings({ userId: session.user.id });

    return NextResponse.json(settings satisfies UserSettingsNotificationsDTO, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }
    console.error('PUT /api/user/settings/notifications error:', error);
    return unknownErrorResponse('Something went wrong');
  }
}
