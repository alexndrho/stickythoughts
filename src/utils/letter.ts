import { getAnonymousLabel } from "@/utils/anonymous";
import type {
  BaseLetterReply,
  BaseLetter,
  BaseUserLetterReply,
  LetterReply,
  Letter,
  UserLetterReply,
} from "@/types/letter";

export function formatLetters({
  sessionUserId,
  letters,
}: {
  sessionUserId?: string;
  letters: BaseLetter[];
}): Letter[];
export function formatLetters({
  sessionUserId,
  letters,
}: {
  sessionUserId?: string;
  letters: BaseLetter;
}): Letter;
export function formatLetters({
  sessionUserId,
  letters,
}: {
  sessionUserId?: string;
  letters: BaseLetter[] | BaseLetter;
}): Letter[] | Letter {
  const formatLetter = (letter: BaseLetter): Letter => {
    const { authorId, likes, _count, ...rest } = letter;

    return {
      ...rest,
      author: rest.isAnonymous || !rest.author ? undefined : rest.author,
      isOwner: sessionUserId === authorId,
      likes: {
        liked: !!(likes && likes.length),
        count: _count.likes,
      },
      replies: {
        count: _count.replies,
      },
    } satisfies Letter;
  };

  return Array.isArray(letters)
    ? letters.map(formatLetter)
    : formatLetter(letters);
}

export function formatLetterReplies(
  replies: BaseLetterReply[],
  sessionUserId?: string,
): LetterReply[];
export function formatLetterReplies(
  replies: BaseLetterReply,
  sessionUserId?: string,
): LetterReply;
export function formatLetterReplies(
  replies: BaseLetterReply[] | BaseLetterReply,
  sessionUserId?: string,
): LetterReply[] | LetterReply {
  const formatLetterReply = (reply: BaseLetterReply): LetterReply => {
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
      author: rest.isAnonymous || !rest.author ? undefined : rest.author,
      isOP,
      isSelf,
      anonymousLabel,
      likes: {
        liked: !!(likes && likes.length),
        count: _count.likes,
      },
    } satisfies LetterReply;
  };

  return Array.isArray(replies)
    ? replies.map(formatLetterReply)
    : formatLetterReply(replies);
}

export function formatUserLetterReplies(
  replies: BaseUserLetterReply[],
): UserLetterReply[];
export function formatUserLetterReplies(
  replies: BaseUserLetterReply,
): UserLetterReply;
export function formatUserLetterReplies(
  replies: BaseUserLetterReply[] | BaseUserLetterReply,
): UserLetterReply[] | UserLetterReply {
  const formatUserLetterReply = (
    reply: BaseUserLetterReply,
  ): UserLetterReply => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorId, likes, _count, ...rest } = reply;

    return {
      ...rest,
      author: rest.isAnonymous || !rest.author ? undefined : rest.author,
      likes: {
        liked: !!(likes && likes.length),
        count: _count.likes,
      },
    };
  };

  return Array.isArray(replies)
    ? replies.map(formatUserLetterReply)
    : formatUserLetterReply(replies);
}
