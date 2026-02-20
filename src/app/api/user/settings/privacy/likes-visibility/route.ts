import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { updateUserLikesVisibilityInput } from '@/lib/validations/user';
import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse, zodInvalidInput } from '@/lib/http';
import { updateUserLikesVisibility } from '@/server/user';

export async function PUT(request: Request) {
  try {
    const { visibility } = updateUserLikesVisibilityInput.parse(await request.json());
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const privacySettings = await updateUserLikesVisibility({
      userId: session.user.id,
      visibility,
    });

    return NextResponse.json(privacySettings, {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }
    if (error instanceof Error) {
      console.error('PUT /api/user/settings/privacy/likes-visibility error:', error.stack);
    }

    return unknownErrorResponse('Something went wrong');
  }
}
