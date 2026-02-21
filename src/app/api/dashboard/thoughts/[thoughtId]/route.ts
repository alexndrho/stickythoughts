import { NextResponse } from 'next/server';

import { revalidateAllThoughts } from '@/lib/cache/thought-revalidation';
import { guardSession } from '@/lib/session-guard';
import { jsonError, unknownErrorResponse } from '@/lib/http/api-responses';
import { isRecordNotFoundError } from '@/server/db/prisma-errors';
import { softDeleteThought } from '@/server/dashboard/thought';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ thoughtId: string }> },
) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        thought: ['delete'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { thoughtId } = await params;

    await softDeleteThought({ thoughtId, deletedById: session.user.id });
    revalidateAllThoughts();

    return NextResponse.json({ message: 'Thought deleted successfully' }, { status: 200 });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return jsonError([{ code: 'not-found', message: 'Thought not found' }], 404);
    }

    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
