import { NextResponse } from 'next/server';

import { unknownErrorResponse } from '@/lib/http/api-responses';
import { verifyCronRequest } from '@/lib/http/cron-auth';
import { softDeleteRejectedContent } from '@/server/cron/soft-delete-rejected';

export async function GET(request: Request) {
  try {
    const authError = verifyCronRequest(request);
    if (authError) return authError;

    const result = await softDeleteRejectedContent();

    return NextResponse.json(
      {
        cutoff: result.cutoff.toISOString(),
        softDeleted: result.softDeleted,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
