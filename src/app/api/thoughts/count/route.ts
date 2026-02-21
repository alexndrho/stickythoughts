import { NextResponse } from 'next/server';

import { unknownErrorResponse } from '@/lib/http/api-responses';
import { countPublicThoughts } from '@/server/thought/thoughts';

export async function GET() {
  try {
    const count = await countPublicThoughts();

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
