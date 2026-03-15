import { type NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { ZodError } from 'zod';

import { revalidateThoughts } from '@/lib/cache/thought-revalidation';
import { createThoughtInput } from '@/lib/validations/thought';
import { jsonError, unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import { createThought, listPublicThoughts } from '@/server/thought/thoughts';
import { toDTO } from '@/lib/http/to-dto';
import {
  parseRandomSeed,
  parseThoughtsSort,
  type PublicThoughtDTO,
  type SubmitThoughtResponseDTO,
} from '@/types/thought';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sort = parseThoughtsSort(searchParams.get('sort'));
  const searchTerm = searchParams.get('searchTerm');
  const lastId = searchParams.get('lastId');
  const seed = parseRandomSeed(searchParams.get('seed'));

  try {
    const thoughts = await listPublicThoughts({ sort, searchTerm, lastId, seed });

    const typedThoughts = toDTO(thoughts) satisfies PublicThoughtDTO[];

    return NextResponse.json(typedThoughts, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}

export async function POST(request: NextRequest) {
  try {
    const verification = await checkBotId();

    if (verification.isBot) {
      return jsonError([{ code: 'botid/validation-failed', message: 'Bot detected' }], 403);
    }

    const { author, message, color } = createThoughtInput.parse(await request.json());

    const thought = await createThought({ author, message, color });

    if (thought.status === 'APPROVED') {
      revalidateThoughts();
    }

    return NextResponse.json(toDTO(thought) satisfies SubmitThoughtResponseDTO, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
