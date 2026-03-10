import { type NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import { listSubmissionThoughts } from '@/server/dashboard/thought';
import {
  thoughtSubmissionsTypeQueryInput,
  thoughtSubmissionTypeToStatus,
} from '@/lib/validations/thought';
import { toDTO } from '@/lib/http/to-dto';
import type { SubmissionThoughtDTO } from '@/types/thought-submission';

export async function GET(request: NextRequest) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        thought: ['list-submissions'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const searchParams = request.nextUrl.searchParams;
    const type = thoughtSubmissionsTypeQueryInput.parse(searchParams.get('type'));
    const page = Math.max(Number(searchParams.get('page') || '1'), 1);

    const items = await listSubmissionThoughts({
      page,
      status: thoughtSubmissionTypeToStatus[type],
    });

    return NextResponse.json(toDTO(items) satisfies SubmissionThoughtDTO[], {
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
