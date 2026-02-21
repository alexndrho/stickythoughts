import { NextResponse } from 'next/server';

import { guardSession } from '@/lib/session-guard';
import { jsonError, unknownErrorResponse } from '@/lib/http/api-responses';
import { likeLetter, unlikeLetter } from '@/server/letter/letter-like';
import { LetterNotFoundError } from '@/server/letter/letter-errors';
import { isRecordNotFoundError, isUniqueConstraintError } from '@/server/db/prisma-errors';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId } = await params;
    await likeLetter({ letterId, userId: session.user.id });

    return NextResponse.json(
      {
        message: 'Post liked successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof LetterNotFoundError) {
      return jsonError([{ code: 'not-found', message: 'Letter post not found' }], 404);
    }

    if (isUniqueConstraintError(error)) {
      return jsonError(
        [
          {
            code: 'validation/unique-constraint',
            message: 'You have already liked this post',
          },
        ],
        409,
      );
    }

    console.error(error);
    return unknownErrorResponse('Unknown error');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({ headers: request.headers });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId } = await params;
    await unlikeLetter({ letterId, userId: session.user.id });

    return NextResponse.json(
      {
        message: 'Post unliked successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return jsonError(
        [
          {
            code: 'validation/unique-constraint',
            message: 'You have not liked this post yet',
          },
        ],
        409,
      );
    }

    console.error(error);
    return unknownErrorResponse('Unknown error');
  }
}
