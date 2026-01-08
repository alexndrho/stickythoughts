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
import type { ThreadType, ThreadCommentType } from "@/types/thread";

export const setLikeThreadQueryData = ({
  username, // optional, used for user-specific queries
  threadId,
  like,
}: {
  username?: string;
  threadId: string;
  like: boolean;
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

  if (username) {
    queryClient.setQueryData<InfiniteData<ThreadType[]>>(
      userUsernameThreadsInfiniteOptions(username).queryKey,
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
      userUsernameLikedThreadsInfiniteOptions(username).queryKey,
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
      queryKey: userUsernameThreadsInfiniteOptions(username).queryKey,
      refetchType: "none",
    });

    queryClient.invalidateQueries({
      queryKey: userUsernameLikedThreadsInfiniteOptions(username).queryKey,
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
}: {
  id: string;
  comment: ThreadCommentType;
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

  queryClient.invalidateQueries({
    queryKey: userOptions.queryKey,
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
}: {
  threadId: string;
  commentId: string;
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

  queryClient.invalidateQueries({
    queryKey: threadCommentsInfiniteOptions(threadId).queryKey,
    refetchType: "none",
  });
};

// comment like
export const setLikeThreadCommentQueryData = ({
  threadId,
  commentId,
  username,
  like,
}: {
  threadId: string;
  commentId: string;
  username: string;
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

  queryClient.setQueryData<InfiniteData<ThreadCommentType[]>>(
    userUsernameCommentsInfiniteOptions(username).queryKey,
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
    queryKey: threadCommentsInfiniteOptions(threadId).queryKey,
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: userUsernameCommentsInfiniteOptions(username).queryKey,
    refetchType: "none",
  });
};
