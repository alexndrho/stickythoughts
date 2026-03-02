import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import {
  saveUserPushSubscription,
  deleteAllUserPushSubscriptions,
} from '@/server/user/user-push-subscriptions';
import { savePushSubscriptionInput } from '@/lib/validations/user';

export async function POST(request: Request) {
  try {
    const body = savePushSubscriptionInput.parse(await request.json());
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    await saveUserPushSubscription(session.user.id, body);

    return NextResponse.json({ message: 'Subscribed' }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }
    console.error('POST /api/user/push-subscriptions error:', error);
    return unknownErrorResponse('Something went wrong');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    await deleteAllUserPushSubscriptions(session.user.id);

    return NextResponse.json({ message: 'Unsubscribed' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/user/push-subscriptions error:', error);
    return unknownErrorResponse('Something went wrong');
  }
}
