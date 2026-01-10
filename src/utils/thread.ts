import type {
  BaseThreadCommentType,
  BaseThreadType,
  BaseUserThreadCommentType,
  ThreadCommentType,
  ThreadType,
  UserThreadCommentType,
} from "@/types/thread";

export function formatThreads({
  sessionUserId,
  threads,
}: {
  sessionUserId?: string;
  threads: BaseThreadType[];
}): ThreadType[] {
  return threads.map((thread) => {
    const { authorId, likes, _count, ...rest } = thread;

    return {
      ...rest,
      author: rest.isAnonymous ? undefined : rest.author,
      isOwner: sessionUserId === authorId,
      likes: {
        liked: !!(likes && likes.length),
        count: _count.likes,
      },
      comments: {
        count: _count.comments,
      },
    } satisfies ThreadType;
  });
}

export function formatThreadComments(
  comments: BaseThreadCommentType[],
): ThreadCommentType[] {
  return comments.map((comment) => {
    const { authorId, likes, _count, ...rest } = comment;

    return {
      ...rest,
      author: rest.isAnonymous ? undefined : rest.author,
      isOP: rest.thread.authorId === authorId,
      likes: {
        liked: !!(likes && likes.length),
        count: _count.likes,
      },
    } satisfies ThreadCommentType;
  });
}

export function formatUserThreadComments(
  comments: BaseUserThreadCommentType[],
): UserThreadCommentType[] {
  return comments.map((comment) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorId, likes, _count, ...rest } = comment;

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
