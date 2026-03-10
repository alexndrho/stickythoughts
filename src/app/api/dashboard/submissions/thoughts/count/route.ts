import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import { countSubmissionThoughts } from '@/server/dashboard/thought';
import {
  thoughtSubmissionsTypeQueryInput,
  thoughtSubmissionTypeToStatus,
} from '@/lib/validations/thought';

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const type = thoughtSubmissionsTypeQueryInput.parse(url.searchParams.get('type'));

    const total = await countSubmissionThoughts({
      status: thoughtSubmissionTypeToStatus[type],
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
