import { NextResponse } from 'next/server';

import { guardSession } from '@/lib/session-guard';
import { jsonError, unknownErrorResponse } from '@/lib/http';
import { getDeletedReplyStatus, purgeReply, restoreReply } from '@/server/dashboard';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ replyId: string }> },
) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        letterReply: ['restore'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { replyId } = await params;

    const reply = await getDeletedReplyStatus({ replyId });

    if (!reply || !reply.deletedAt) {
      return jsonError([{ code: 'not-found', message: 'Reply not found' }], 404);
    }

    await restoreReply({ replyId });

    return NextResponse.json({ message: 'Reply restored successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ replyId: string }> },
) {
  try {
    const session = await guardSession({
      headers: request.headers,
      permission: {
        letterReply: ['purge'],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const { replyId } = await params;

    const reply = await getDeletedReplyStatus({ replyId });

    if (!reply || !reply.deletedAt) {
      return jsonError([{ code: 'not-found', message: 'Reply not found' }], 404);
    }

    await purgeReply({ replyId });

    return NextResponse.json({ message: 'Reply deleted permanently' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}
