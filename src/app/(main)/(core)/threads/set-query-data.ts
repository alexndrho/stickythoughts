import { type InfiniteData } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import {
  userUsernameThreadsInfiniteOptions,
  userOptions,
  userUsernameLikedThreadsInfiniteOptions,
  userUsernameCommentsInfiniteOptions,
} from "../user/options";
import {
  threadsInfiniteOptions,
  threadCommentsInfiniteOptions,
  threadOptions,
} from "@/app/(main)/(core)/threads/options";
import type {
  ThreadType,
  ThreadCommentType,
  UserThreadCommentType,
} from "@/types/thread";

export const setLikeThreadQueryData = ({
  threadId,
  like,
  authorUsername, // optional, used for user-specific queries
}: {
  threadId: string;
  like: boolean;
  authorUsername?: string;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<ThreadType>(
    threadOptions(threadId).queryKey,
    (oldData) =>
      oldData
        ? ({
            ...oldData,
            likes: {
              ...oldData.likes,
              liked: like,
              count: oldData.likes.liked
                ? oldData.likes.count - 1
                : oldData.likes.count + 1,
            },
          } satisfies ThreadType)
        : oldData,
  );

  queryClient.setQueryData<InfiniteData<ThreadType[]>>(
    threadsInfiniteOptions.queryKey,
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.map((post) =>
            post.id === threadId
              ? ({
                  ...post,
                  likes: {
                    ...post.likes,
                    liked: like,
                    count: like ? post.likes.count + 1 : post.likes.count - 1,
                  },
                } satisfies ThreadType)
              : post,
          ),
        ),
      };
    },
  );

  if (authorUsername) {
    queryClient.setQueryData<InfiniteData<ThreadType[]>>(
      userUsernameThreadsInfiniteOptions(authorUsername).queryKey,
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((post) =>
              post.id === threadId
                ? ({
                    ...post,
                    likes: {
                      ...post.likes,
                      liked: like,
                      count: like ? post.likes.count + 1 : post.likes.count - 1,
                    },
                  } satisfies ThreadType)
                : post,
            ),
          ),
        };
      },
    );

    queryClient.setQueryData<InfiniteData<ThreadType[]>>(
      userUsernameLikedThreadsInfiniteOptions(authorUsername).queryKey,
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((post) =>
              post.id === threadId
                ? ({
                    ...post,
                    likes: {
                      ...post.likes,
                      liked: like,
                      count: like ? post.likes.count + 1 : post.likes.count - 1,
                    },
                  } satisfies ThreadType)
                : post,
            ),
          ),
        };
      },
    );

    queryClient.invalidateQueries({
      queryKey: userUsernameThreadsInfiniteOptions(authorUsername).queryKey,
      refetchType: "none",
    });

    queryClient.invalidateQueries({
      queryKey:
        userUsernameLikedThreadsInfiniteOptions(authorUsername).queryKey,
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userOptions.queryKey,
    });
  }

  queryClient.invalidateQueries({
    queryKey: threadOptions(threadId).queryKey,
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: threadsInfiniteOptions.queryKey,
    refetchType: "none",
  });
};

export const setCreateThreadCommentQueryData = ({
  id,
  comment,
  authorUsername,
}: {
  id: string;
  comment: ThreadCommentType;
  authorUsername?: string;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<ThreadCommentType[]>>(
    threadCommentsInfiniteOptions(id).queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: [
          [
            {
              ...comment,
            } satisfies ThreadCommentType,
          ],
          ...oldData.pages,
        ],
      };
    },
  );

  queryClient.setQueryData<ThreadType>(threadOptions(id).queryKey, (oldData) =>
    oldData
      ? ({
          ...oldData,
          comments: {
            ...oldData.comments,
            count: oldData.comments.count + 1,
          },
        } satisfies ThreadType)
      : oldData,
  );

  queryClient.setQueryData<InfiniteData<ThreadType[]>>(
    threadsInfiniteOptions.queryKey,
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.map((post) =>
            post.id === id
              ? ({
                  ...post,
                  comments: {
                    ...post.comments,
                    count: post.comments.count + 1,
                  },
                } satisfies ThreadType)
              : post,
          ),
        ),
      };
    },
  );

  if (authorUsername) {
    queryClient.invalidateQueries({
      queryKey: userUsernameCommentsInfiniteOptions(authorUsername).queryKey,
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userOptions.queryKey,
    });
  }

  queryClient.invalidateQueries({
    queryKey: threadCommentsInfiniteOptions(id).queryKey,
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: threadOptions(id).queryKey,
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: threadsInfiniteOptions.queryKey,
    refetchType: "none",
  });
};

export const setUpdateThreadCommentQueryData = ({
  threadId,
  commentId,
  comment,
}: {
  threadId: string;
  commentId: string;
  comment: ThreadCommentType;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<ThreadCommentType[]>>(
    threadCommentsInfiniteOptions(threadId).queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.map((cmt) =>
            cmt.id === commentId
              ? ({
                  ...cmt,
                  ...comment,
                } satisfies ThreadCommentType)
              : cmt,
          ),
        ),
      };
    },
  );

  queryClient.invalidateQueries({
    queryKey: threadCommentsInfiniteOptions(threadId).queryKey,
    refetchType: "none",
  });
};

export const setDeleteThreadCommentQueryData = ({
  threadId,
  commentId,
  authorUsername,
}: {
  threadId: string;
  commentId: string;
  authorUsername?: string;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<ThreadCommentType[]>>(
    threadCommentsInfiniteOptions(threadId).queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.filter((comment) => comment.id !== commentId),
        ),
      };
    },
  );

  if (authorUsername) {
    queryClient.setQueryData<InfiniteData<UserThreadCommentType[]>>(
      userUsernameCommentsInfiniteOptions(authorUsername).queryKey,
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.filter((comment) => comment.id !== commentId),
          ),
        };
      },
    );

    queryClient.invalidateQueries({
      queryKey: userUsernameCommentsInfiniteOptions(authorUsername).queryKey,
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userOptions.queryKey,
    });
  }

  queryClient.invalidateQueries({
    queryKey: threadCommentsInfiniteOptions(threadId).queryKey,
    refetchType: "none",
  });
};

// comment like
export const setLikeThreadCommentQueryData = ({
  threadId,
  commentId,
  authorUsername,
  like,
}: {
  threadId: string;
  commentId: string;
  authorUsername?: string;
  like: boolean;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<ThreadCommentType[]>>(
    threadCommentsInfiniteOptions(threadId).queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.map((comment) =>
            comment.id === commentId
              ? ({
                  ...comment,
                  likes: {
                    ...comment.likes,
                    liked: like,
                    count: like
                      ? comment.likes.count + 1
                      : comment.likes.count - 1,
                  },
                } satisfies ThreadCommentType)
              : comment,
          ),
        ),
      };
    },
  );

  if (authorUsername) {
    queryClient.setQueryData<InfiniteData<ThreadCommentType[]>>(
      userUsernameCommentsInfiniteOptions(authorUsername).queryKey,
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((comment) =>
              comment.id === commentId
                ? ({
                    ...comment,
                    likes: {
                      ...comment.likes,
                      liked: like,
                      count: like
                        ? comment.likes.count + 1
                        : comment.likes.count - 1,
                    },
                  } satisfies ThreadCommentType)
                : comment,
            ),
          ),
        };
      },
    );

    queryClient.invalidateQueries({
      queryKey: userUsernameCommentsInfiniteOptions(authorUsername).queryKey,
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userOptions.queryKey,
    });
  }

  queryClient.invalidateQueries({
    queryKey: threadCommentsInfiniteOptions(threadId).queryKey,
    refetchType: "none",
  });
};
