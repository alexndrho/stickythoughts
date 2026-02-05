import type {
  BaseLetterReplyType,
  BaseLetterType,
  BaseUserLetterReplyType,
  LetterReplyType,
  LetterType,
  UserLetterReplyType,
} from "@/types/letter";

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
): LetterReplyType[] {
  return replies.map((reply) => {
    const { authorId, likes, _count, ...rest } = reply;

    return {
      ...rest,
      author: rest.isAnonymous ? undefined : rest.author,
      isOP: rest.letter.authorId === authorId,
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
