import { type NextRequest, NextResponse } from 'next/server';

import { guardSession } from '@/lib/session-guard';
import { unknownErrorResponse } from '@/lib/http/api-responses';
import { listDeletedThoughts } from '@/server/dashboard/thought';
import type { DeletedThoughtDTO } from '@/types/deleted';
import { toDTO } from '@/lib/http/to-dto';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(Number(searchParams.get('page') || '1'), 1);
    const items = await listDeletedThoughts({ page });

    return NextResponse.json(toDTO(items) satisfies DeletedThoughtDTO[], {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
