import { NextResponse } from 'next/server';

import { unknownErrorResponse } from '@/lib/http/api-responses';
import { verifyCronRequest } from '@/lib/http/cron-auth';
import { purgeSoftDeletedContent } from '@/server/cron/purge';

export async function GET(request: Request) {
  try {
    const authError = verifyCronRequest(request);
    if (authError) return authError;

    const result = await purgeSoftDeletedContent();

    return NextResponse.json(
      {
        cutoff: result.cutoff.toISOString(),
        deleted: result.deleted,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
