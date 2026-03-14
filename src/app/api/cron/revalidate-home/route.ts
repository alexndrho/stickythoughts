import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { jsonError, unknownErrorResponse } from '@/lib/http/api-responses';

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return jsonError(
        [
          {
            code: 'config/missing-cron-secret',
            message: 'CRON_SECRET is not configured',
          },
        ],
        500,
      );
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return jsonError([{ code: 'auth/unauthorized', message: 'Unauthorized' }], 401);
    }

    revalidatePath('/', 'page');

    return NextResponse.json({ revalidated: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
