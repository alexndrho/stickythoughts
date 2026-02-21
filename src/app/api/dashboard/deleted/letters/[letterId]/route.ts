import { NextResponse } from 'next/server';

import { guardSession } from '@/lib/session-guard';
import { jsonError, unknownErrorResponse } from '@/lib/http/api-responses';
import { getDeletedLetterStatus, purgeLetter, restoreLetter } from '@/server/dashboard/letter';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        letter: ['restore'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId } = await params;

    const letter = await getDeletedLetterStatus({ letterId });

    if (!letter || !letter.deletedAt) {
      return jsonError([{ code: 'not-found', message: 'Letter not found' }], 404);
    }

    await restoreLetter({ letterId });

    return NextResponse.json({ message: 'Letter restored successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ letterId: string }> },
) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        letter: ['purge'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { letterId } = await params;

    const letter = await getDeletedLetterStatus({ letterId });

    if (!letter || !letter.deletedAt) {
      return jsonError([{ code: 'not-found', message: 'Letter not found' }], 404);
    }

    await purgeLetter({ letterId });

    return NextResponse.json({ message: 'Letter deleted permanently' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
