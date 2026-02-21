import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';
import { formatUserLetterReplies } from '@/utils/letter';
import { unknownErrorResponse } from '@/lib/http/api-responses';
import { listUserReplies } from '@/server/user/user-profile';
import { toDTO } from '@/lib/http/to-dto';
import type { UserLetterReplyDTO } from '@/types/letter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const searchParams = request.nextUrl.searchParams;
  const lastId = searchParams.get('lastId');

  try {
    const { username } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const replies = await listUserReplies({
      username,
      lastId,
      viewerUsername: session?.user?.username ?? null,
      viewerUserId: session?.user?.id,
    });

    const formattedReplies = formatUserLetterReplies(replies);

    return NextResponse.json(toDTO(formattedReplies) satisfies UserLetterReplyDTO[]);
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
