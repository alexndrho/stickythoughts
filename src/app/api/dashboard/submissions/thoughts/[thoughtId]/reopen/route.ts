import { NextResponse } from 'next/server';

import { guardSession } from '@/lib/session-guard';
import { jsonError, unknownErrorResponse } from '@/lib/http/api-responses';
import { getSubmissionThoughtStatus, reopenSubmissionThought } from '@/server/dashboard/thought';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ thoughtId: string }> },
) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permissions: {
        thought: ['review'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { thoughtId } = await params;
    const thought = await getSubmissionThoughtStatus({ thoughtId });

    if (!thought || thought.deletedAt) {
      return jsonError([{ code: 'not-found', message: 'Thought not found' }], 404);
    }

    if (thought.status !== 'REJECTED') {
      return jsonError(
        [
          {
            code: 'validation/invalid-request',
            message: 'Only rejected thoughts can be reopened',
          },
        ],
        400,
      );
    }

    await reopenSubmissionThought({ thoughtId });

    return NextResponse.json({ message: 'Thought reopened successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
