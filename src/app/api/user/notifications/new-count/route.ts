import { NextResponse } from 'next/server';

import { userNotificationOpenedInput } from '@/lib/validations/user';
import { guardSession } from '@/lib/session-guard';
import { jsonError, unknownErrorResponse } from '@/lib/http';
import { countNewUserNotifications, setNotificationsOpened } from '@/server/user';
import { UserNotFoundError } from '@/server/user';

export async function GET(request: Request) {
  try {
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const count = await countNewUserNotifications({ userId: session.user.id });

    return NextResponse.json({
      count,
    });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return jsonError([{ code: 'not-found', message: 'User not found' }], 404);
    }

    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}

export async function PUT(request: Request) {
  try {
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const { opened } = userNotificationOpenedInput.parse(await request.json());

    await setNotificationsOpened({ userId: session.user.id, opened });

    return NextResponse.json({ message: 'Notifications updated successfully' });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Unknown error');
  }
}
