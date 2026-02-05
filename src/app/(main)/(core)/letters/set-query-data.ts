import { type InfiniteData } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import {
  userUsernameLettersInfiniteOptions,
  userOptions,
  userUsernameLikedLettersInfiniteOptions,
  userUsernameRepliesInfiniteOptions,
} from "../user/options";
import {
  lettersInfiniteOptions,
  letterRepliesInfiniteOptions,
  letterOptions,
} from "@/app/(main)/(core)/letters/options";
import { deletedRepliesOptions } from "@/app/dashboard/deleted/options";
import type {
  LetterType,
  LetterReplyType,
  UserLetterReplyType,
} from "@/types/letter";

export const setLikeLetterQueryData = ({
  letterId,
  like,
  authorUsername, // optional, used for user-specific queries
}: {
  letterId: string;
  like: boolean;
  authorUsername?: string;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<LetterType>(
    letterOptions(letterId).queryKey,
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
          } satisfies LetterType)
        : oldData,
  );

  queryClient.setQueryData<InfiniteData<LetterType[]>>(
    lettersInfiniteOptions.queryKey,
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.map((post) =>
            post.id === letterId
              ? ({
                  ...post,
                  likes: {
                    ...post.likes,
                    liked: like,
                    count: like ? post.likes.count + 1 : post.likes.count - 1,
                  },
                } satisfies LetterType)
              : post,
          ),
        ),
      };
    },
  );

  if (authorUsername) {
    queryClient.setQueryData<InfiniteData<LetterType[]>>(
      userUsernameLettersInfiniteOptions(authorUsername).queryKey,
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((post) =>
              post.id === letterId
                ? ({
                    ...post,
                    likes: {
                      ...post.likes,
                      liked: like,
                      count: like ? post.likes.count + 1 : post.likes.count - 1,
                    },
                  } satisfies LetterType)
                : post,
            ),
          ),
        };
      },
    );

    queryClient.setQueryData<InfiniteData<LetterType[]>>(
      userUsernameLikedLettersInfiniteOptions(authorUsername).queryKey,
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((post) =>
              post.id === letterId
                ? ({
                    ...post,
                    likes: {
                      ...post.likes,
                      liked: like,
                      count: like ? post.likes.count + 1 : post.likes.count - 1,
                    },
                  } satisfies LetterType)
                : post,
            ),
          ),
        };
      },
    );

    queryClient.invalidateQueries({
      queryKey: userUsernameLettersInfiniteOptions(authorUsername).queryKey,
      refetchType: "none",
    });

    queryClient.invalidateQueries({
      queryKey:
        userUsernameLikedLettersInfiniteOptions(authorUsername).queryKey,
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userOptions.queryKey,
    });
  }

  queryClient.invalidateQueries({
    queryKey: letterOptions(letterId).queryKey,
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: lettersInfiniteOptions.queryKey,
    refetchType: "none",
  });
};

export const setCreateLetterReplyQueryData = ({
  id,
  reply,
  authorUsername,
}: {
  id: string;
  reply: LetterReplyType;
  authorUsername?: string;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<LetterReplyType[]>>(
    letterRepliesInfiniteOptions(id).queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: [
          [
            {
              ...reply,
            } satisfies LetterReplyType,
          ],
          ...oldData.pages,
        ],
      };
    },
  );

  queryClient.setQueryData<LetterType>(letterOptions(id).queryKey, (oldData) =>
    oldData
      ? ({
          ...oldData,
          replies: {
            ...oldData.replies,
            count: oldData.replies.count + 1,
          },
        } satisfies LetterType)
      : oldData,
  );

  queryClient.setQueryData<InfiniteData<LetterType[]>>(
    lettersInfiniteOptions.queryKey,
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.map((post) =>
            post.id === id
              ? ({
                  ...post,
                  replies: {
                    ...post.replies,
                    count: post.replies.count + 1,
                  },
                } satisfies LetterType)
              : post,
          ),
        ),
      };
    },
  );

  if (authorUsername) {
    queryClient.invalidateQueries({
      queryKey: userUsernameRepliesInfiniteOptions(authorUsername).queryKey,
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userOptions.queryKey,
    });
  }

  queryClient.invalidateQueries({
    queryKey: letterRepliesInfiniteOptions(id).queryKey,
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: letterOptions(id).queryKey,
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: lettersInfiniteOptions.queryKey,
    refetchType: "none",
  });
};

export const setUpdateLetterReplyQueryData = ({
  letterId,
  replyId,
  reply,
}: {
  letterId: string;
  replyId: string;
  reply: LetterReplyType;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<LetterReplyType[]>>(
    letterRepliesInfiniteOptions(letterId).queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.map((cmt) =>
            cmt.id === replyId
              ? ({
                  ...cmt,
                  ...reply,
                } satisfies LetterReplyType)
              : cmt,
          ),
        ),
      };
    },
  );

  queryClient.invalidateQueries({
    queryKey: letterRepliesInfiniteOptions(letterId).queryKey,
    refetchType: "none",
  });
};

export const setDeleteLetterReplyQueryData = ({
  letterId,
  replyId,
  authorUsername,
}: {
  letterId: string;
  replyId: string;
  authorUsername?: string;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<LetterReplyType[]>>(
    letterRepliesInfiniteOptions(letterId).queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.filter((reply) => reply.id !== replyId),
        ),
      };
    },
  );

  if (authorUsername) {
    queryClient.setQueryData<InfiniteData<UserLetterReplyType[]>>(
      userUsernameRepliesInfiniteOptions(authorUsername).queryKey,
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.filter((reply) => reply.id !== replyId),
          ),
        };
      },
    );

    queryClient.invalidateQueries({
      queryKey: userUsernameRepliesInfiniteOptions(authorUsername).queryKey,
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userOptions.queryKey,
    });
  }

  queryClient.invalidateQueries({
    queryKey: letterRepliesInfiniteOptions(letterId).queryKey,
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: deletedRepliesOptions.queryKey,
  });
};

// reply like
export const setLikeLetterReplyQueryData = ({
  letterId,
  replyId,
  authorUsername,
  like,
}: {
  letterId: string;
  replyId: string;
  authorUsername?: string;
  like: boolean;
}) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<LetterReplyType[]>>(
    letterRepliesInfiniteOptions(letterId).queryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.map((reply) =>
            reply.id === replyId
              ? ({
                  ...reply,
                  likes: {
                    ...reply.likes,
                    liked: like,
                    count: like
                      ? reply.likes.count + 1
                      : reply.likes.count - 1,
                  },
                } satisfies LetterReplyType)
              : reply,
          ),
        ),
      };
    },
  );

  if (authorUsername) {
    queryClient.setQueryData<InfiniteData<LetterReplyType[]>>(
      userUsernameRepliesInfiniteOptions(authorUsername).queryKey,
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((reply) =>
              reply.id === replyId
                ? ({
                    ...reply,
                    likes: {
                      ...reply.likes,
                      liked: like,
                      count: like
                        ? reply.likes.count + 1
                        : reply.likes.count - 1,
                    },
                  } satisfies LetterReplyType)
                : reply,
            ),
          ),
        };
      },
    );

    queryClient.invalidateQueries({
      queryKey: userUsernameRepliesInfiniteOptions(authorUsername).queryKey,
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userOptions.queryKey,
    });
  }

  queryClient.invalidateQueries({
    queryKey: letterRepliesInfiniteOptions(letterId).queryKey,
    refetchType: "none",
  });
};
