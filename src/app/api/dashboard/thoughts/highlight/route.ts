import { NextResponse } from 'next/server';

import { guardSession } from '@/lib/session-guard';
import { getHighlightedThought } from '@/server/dashboard/thought-service';
import { unknownErrorResponse } from '@/lib/http';
import type { PrivateHighlightedThoughtDTO } from '@/types/thought';
import { toDTO } from '@/lib/http/to-dto';

export async function GET(request: Request) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        thought: ['list'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const highlightedThought = await getHighlightedThought();

    return NextResponse.json(
      toDTO(highlightedThought) satisfies PrivateHighlightedThoughtDTO | null,
    );
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
