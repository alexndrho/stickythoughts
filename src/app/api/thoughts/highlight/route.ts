import { NextResponse } from 'next/server';

import { getHighlightedThought } from '@/server/thought';
import { unknownErrorResponse } from '@/lib/http';
import { toDTO } from '@/lib/http/to-dto';
import type { PublicThoughtDTO } from '@/types/thought';

export async function GET() {
  try {
    const highlightedThought = await getHighlightedThought();

    if (!highlightedThought) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(toDTO(highlightedThought) satisfies PublicThoughtDTO);
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
