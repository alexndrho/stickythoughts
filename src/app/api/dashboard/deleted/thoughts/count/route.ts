import { NextResponse } from 'next/server';

import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse } from '@/lib/http';
import { countDeletedThoughts } from '@/server/dashboard';

export async function GET(request: Request) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        thought: ['list-deleted'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const total = await countDeletedThoughts();

    return NextResponse.json({ total }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
