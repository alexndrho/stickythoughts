import { NextResponse } from 'next/server';

import { unknownErrorResponse } from '@/lib/http';
import { countPublicThoughts } from '@/server/thought';

export async function GET() {
  try {
    const count = await countPublicThoughts();

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
