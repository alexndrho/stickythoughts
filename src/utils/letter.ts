import type {
  BaseLetterReplyType,
  BaseLetterType,
  BaseUserLetterReplyType,
  LetterReplyType,
  LetterType,
  UserLetterReplyType,
} from "@/types/letter";
import { getAnonymousLabel } from "@/utils/anonymous";

export function formatLetters({
  sessionUserId,
  letters,
}: {
  sessionUserId?: string;
  letters: BaseLetterType[];
}): LetterType[] {
  return letters.map((letter) => {
    const { authorId, likes, _count, ...rest } = letter;

    return {
      ...rest,
      author: rest.isAnonymous ? undefined : rest.author,
      isOwner: sessionUserId === authorId,
      likes: {
        liked: !!(likes && likes.length),
        count: _count.likes,
      },
      replies: {
        count: _count.replies,
      },
    } satisfies LetterType;
  });
}

export function formatLetterReplies(
  replies: BaseLetterReplyType[],
  sessionUserId?: string,
): LetterReplyType[] {
  return replies.map((reply) => {
    const { authorId, likes, _count, ...rest } = reply;
    const isOP =
      rest.letter.authorId === authorId &&
      rest.letter.isAnonymous === rest.isAnonymous;
    const isSelf = sessionUserId === authorId;
    const anonymousLabel =
      rest.isAnonymous && !isOP
        ? getAnonymousLabel({ letterId: rest.letterId, authorId })
        : undefined;

    return {
      ...rest,
      author: rest.isAnonymous ? undefined : rest.author,
      isOP,
      isSelf,
      anonymousLabel,
      likes: {
        liked: !!(likes && likes.length),
        count: _count.likes,
      },
    } satisfies LetterReplyType;
  });
}

export function formatUserLetterReplies(
  replies: BaseUserLetterReplyType[],
): UserLetterReplyType[] {
  return replies.map((reply) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorId, likes, _count, ...rest } = reply;

    return {
      ...rest,
      author: rest.isAnonymous ? undefined : rest.author,
      likes: {
        liked: !!(likes && likes.length),
        count: _count.likes,
      },
    };
  });
}
