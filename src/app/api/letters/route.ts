import { type NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { ZodError } from 'zod';

import { auth } from '@/lib/auth';
import { createLetterServerInput } from '@/lib/validations/letter';
import { formatLetters } from '@/utils/letter';
import { jsonError, unknownErrorResponse, zodInvalidInput } from '@/lib/http/api-responses';
import { createLetter, listLettersPublic } from '@/server/letter/letters';
import { toDTO } from '@/lib/http/to-dto';
import type { LetterDTO } from '@/types/letter';

export async function POST(request: Request) {
  try {
    const verification = await checkBotId();

    if (verification.isBot) {
      return jsonError([{ code: 'botid/validation-failed', message: 'Bot detected' }], 403);
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { recipient, body, isAnonymous } = createLetterServerInput.parse(await request.json());

    const post = await createLetter({
      session,
      recipient,
      body,
      isAnonymous,
    });

    return NextResponse.json({
      id: post.id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lastId = searchParams.get('lastId');

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const letters = await listLettersPublic({
      lastId,
      viewerUserId: session?.user.id,
    });

    const formattedPosts = formatLetters({
      sessionUserId: session?.user?.id,
      letters,
    });

    return NextResponse.json(toDTO(formattedPosts) satisfies LetterDTO[], {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
