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
}): LetterType[];
export function formatLetters({
  sessionUserId,
  letters,
}: {
  sessionUserId?: string;
  letters: BaseLetterType;
}): LetterType;
export function formatLetters({
  sessionUserId,
  letters,
}: {
  sessionUserId?: string;
  letters: BaseLetterType[] | BaseLetterType;
}): LetterType[] | LetterType {
  const formatLetter = (letter: BaseLetterType): LetterType => {
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
  };

  return Array.isArray(letters)
    ? letters.map(formatLetter)
    : formatLetter(letters);
}

export function formatLetterReplies(
  replies: BaseLetterReplyType[],
  sessionUserId?: string,
): LetterReplyType[];
export function formatLetterReplies(
  replies: BaseLetterReplyType,
  sessionUserId?: string,
): LetterReplyType;
export function formatLetterReplies(
  replies: BaseLetterReplyType[] | BaseLetterReplyType,
  sessionUserId?: string,
): LetterReplyType[] | LetterReplyType {
  const formatLetterReply = (reply: BaseLetterReplyType): LetterReplyType => {
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
  };

  return Array.isArray(replies)
    ? replies.map(formatLetterReply)
    : formatLetterReply(replies);
}

export function formatUserLetterReplies(
  replies: BaseUserLetterReplyType[],
): UserLetterReplyType[];
export function formatUserLetterReplies(
  replies: BaseUserLetterReplyType,
): UserLetterReplyType;
export function formatUserLetterReplies(
  replies: BaseUserLetterReplyType[] | BaseUserLetterReplyType,
): UserLetterReplyType[] | UserLetterReplyType {
  const formatUserLetterReply = (
    reply: BaseUserLetterReplyType,
  ): UserLetterReplyType => {
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
  };

  return Array.isArray(replies)
    ? replies.map(formatUserLetterReply)
    : formatUserLetterReply(replies);
}
