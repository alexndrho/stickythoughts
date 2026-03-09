import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import { countSubmissionLetters } from '@/server/dashboard/letter';
import { letterSubmissionsTypeQueryInput, submissionTypeToStatus } from '@/lib/validations/letter';

export async function GET(request: Request) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        letter: ['list-submissions'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const url = new URL(request.url);
    const type = letterSubmissionsTypeQueryInput.parse(url.searchParams.get('type'));

    const total = await countSubmissionLetters({
      status: submissionTypeToStatus[type],
    });

    return NextResponse.json({ total }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
