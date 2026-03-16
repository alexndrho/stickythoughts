import { type NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import { listSubmissionLetters } from '@/server/dashboard/letter';
import { submissionsTypeQueryInput, submissionTypeToStatuses } from '@/lib/validations/submission';
import { toDTO } from '@/lib/http/to-dto';
import type { SubmissionLetterDTO } from '@/types/submission';

export async function GET(request: NextRequest) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permissions: {
        letter: ['list-submissions'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const searchParams = request.nextUrl.searchParams;
    const type = submissionsTypeQueryInput.parse(searchParams.get('type'));
    const page = Math.max(Number(searchParams.get('page') || '1'), 1);

    const items = await listSubmissionLetters({
      page,
      statuses: [...submissionTypeToStatuses[type]],
    });

    return NextResponse.json(toDTO(items) satisfies SubmissionLetterDTO[], {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
