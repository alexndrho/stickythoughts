import { type NextRequest, NextResponse } from 'next/server';

import { updateUserBioInput } from '@/lib/validations/user';
import z from 'zod';
import { guardSession } from '@/lib/session-guard';
import { jsonError, unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import { clearUserBio, updateUserBio } from '@/server/user/user';

export async function PUT(request: Request) {
  try {
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const { bio } = updateUserBioInput.parse(await request.json());

    await updateUserBio({ userId: session.user.id, bio });

    return NextResponse.json(
      {
        message: 'User bio updated successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return zodInvalidInput(error);
    }

    console.error('Error updating user bio:', error);
    return unknownErrorResponse('Unknown error');
  }
}

// allows admins to delete a user's bio. note: users can clear their own bio by setting it to an empty string.
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  try {
    if (!userId) {
      return jsonError(
        [
          {
            code: 'validation/invalid-request',
            message: 'User ID is required',
          },
        ],
        400,
      );
    }

    const session = await guardSession({
      headers: request.headers,
      permission: { user: ['update'] },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    await clearUserBio({ userId });

    return NextResponse.json(
      {
        message: 'User bio deleted successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting user bio:', error);
    return unknownErrorResponse('Unknown error');
  }
}
