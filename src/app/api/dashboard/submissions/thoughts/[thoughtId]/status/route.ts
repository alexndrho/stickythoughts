import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { guardSession } from '@/lib/session-guard';
import { jsonError, unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import { reviewThoughtServerInput } from '@/lib/validations/thought';
import { getSubmissionThoughtStatus, setSubmissionThoughtStatus } from '@/server/dashboard/thought';
import { revalidateThoughts } from '@/lib/cache/thought-revalidation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ thoughtId: string }> },
) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        thought: ['review'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { status } = reviewThoughtServerInput.parse(await request.json());

    const { thoughtId } = await params;
    const thought = await getSubmissionThoughtStatus({ thoughtId });

    if (!thought || thought.deletedAt) {
      return jsonError([{ code: 'not-found', message: 'Thought not found' }], 404);
    }

    if (thought.status === status) {
      return NextResponse.json(
        { message: `Thought is already ${status.toLowerCase()}` },
        { status: 200 },
      );
    }

    await setSubmissionThoughtStatus({
      thoughtId,
      status,
      statusSetById: session.user.id,
    });

    revalidateThoughts();

    return NextResponse.json(
      { message: `Thought ${status.toLowerCase()} successfully` },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
