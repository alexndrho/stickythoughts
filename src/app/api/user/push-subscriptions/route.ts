import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import { saveUserPushSubscription } from '@/server/user/user-push-subscriptions';
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
