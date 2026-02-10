import { type InfiniteData } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { letterKeys } from "@/lib/query-keys";
import { userKeys } from "@/lib/query-keys";
import { adminKeys } from "@/lib/query-keys";
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
    letterKeys.byId(letterId),
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
    letterKeys.infiniteList(),
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
      userKeys.infiniteLetters(authorUsername),
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
      userKeys.infiniteLikes(authorUsername),
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
      queryKey: userKeys.infiniteLetters(authorUsername),
      refetchType: "none",
    });

    queryClient.invalidateQueries({
      queryKey: userKeys.infiniteLikes(authorUsername),
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userKeys.all(),
    });
  }

  queryClient.invalidateQueries({
    queryKey: letterKeys.byId(letterId),
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: letterKeys.infiniteList(),
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
    letterKeys.infiniteReplies(id),
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

  queryClient.setQueryData<LetterType>(letterKeys.byId(id), (oldData) =>
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
    letterKeys.infiniteList(),
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
      queryKey: userKeys.infiniteReplies(authorUsername),
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userKeys.all(),
    });
  }

  queryClient.invalidateQueries({
    queryKey: letterKeys.infiniteReplies(id),
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: letterKeys.byId(id),
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: letterKeys.infiniteList(),
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
    letterKeys.infiniteReplies(letterId),
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
    queryKey: letterKeys.infiniteReplies(letterId),
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
    letterKeys.infiniteReplies(letterId),
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
      userKeys.infiniteReplies(authorUsername),
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
      queryKey: userKeys.infiniteReplies(authorUsername),
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userKeys.all(),
    });
  }

  queryClient.invalidateQueries({
    queryKey: letterKeys.infiniteReplies(letterId),
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: adminKeys.deletedReplies(),
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
    letterKeys.infiniteReplies(letterId),
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
      userKeys.infiniteReplies(authorUsername),
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
      queryKey: userKeys.infiniteReplies(authorUsername),
      refetchType: "none",
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: userKeys.all(),
    });
  }

  queryClient.invalidateQueries({
    queryKey: letterKeys.infiniteReplies(letterId),
    refetchType: "none",
  });
};
