import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { formatLetters } from '@/utils/letter';
import { unknownErrorResponse } from '@/lib/http';
import { listUserLetters } from '@/server/user';
import { toDTO } from '@/lib/http/to-dto';
import type { LetterDTO } from '@/types/letter';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) => {
  const searchParams = request.nextUrl.searchParams;
  const lastId = searchParams.get('lastId');

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { username } = await params;

    const letters = await listUserLetters({
      username,
      lastId,
      viewerUsername: session?.user?.username ?? null,
      viewerUserId: session?.user?.id,
    });

    const formattedLetters = formatLetters({
      sessionUserId: session?.user?.id,
      letters,
    });

    return NextResponse.json(toDTO(formattedLetters) satisfies LetterDTO[]);
  } catch (error) {
    console.error('Error fetching user letters:', error);
    return unknownErrorResponse('Unknown error');
  }
};
