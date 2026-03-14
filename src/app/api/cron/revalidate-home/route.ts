import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { unknownErrorResponse } from '@/lib/http/api-responses';
import { verifyCronRequest } from '@/lib/http/cron-auth';

export async function GET(request: Request) {
  try {
    const authError = verifyCronRequest(request);
    if (authError) return authError;

    revalidatePath('/', 'page');

    return NextResponse.json({ revalidated: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
