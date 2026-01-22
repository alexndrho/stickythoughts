"use client";

import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Tabs } from "@mantine/core";

import { type authClient } from "@/lib/auth-client";
import { userUsernameCommentsInfiniteOptions } from "../options";
import { setLikeThreadCommentQueryData } from "../../threads/set-query-data";
import { likeThreadComment, unlikeThreadComment } from "@/services/thread";
import InfiniteScroll from "@/components/InfiniteScroll";
import { ThreadsSkeleton } from "../../threads/ThreadsSkeleton";
import UserCommentItem from "./UserCommentItem";
import CommentPrompt from "./CommentPrompt";
import classes from "./user.module.css";

export interface CommentsTabProps {
  username: string;
  session: ReturnType<typeof authClient.useSession>["data"];
  openSignInWarningModal: () => void;
  isActive: boolean;
}

export default function CommentsTab({
  username,
  session,
  isActive,
  openSignInWarningModal,
}: CommentsTabProps) {
  const {
    data: comments,
    isFetching: isCommentsFetching,
    fetchNextPage: fetchNextCommentsPage,
    hasNextPage: hasNextCommentsPage,
  } = useInfiniteQuery({
    ...userUsernameCommentsInfiniteOptions(username),
    enabled: isActive,
  });

  const likeMutation = useMutation({
    mutationFn: async ({
      threadId,
      commentId,
      like,
    }: {
      threadId: string;
      commentId: string;
      like: boolean;
    }) => {
      if (like) {
        await likeThreadComment({
          threadId,
          commentId,
        });
      } else {
        await unlikeThreadComment({
          threadId,
          commentId,
        });
      }

      return { threadId, commentId, like };
    },
    onSuccess: (data) => {
      setLikeThreadCommentQueryData({
        threadId: data.threadId,
        commentId: data.commentId,
        authorUsername: username,
        like: data.like,
      });
    },
  });

  const handleLike = ({
    threadId,
    commentId,
    like,
  }: {
    threadId: string;
    commentId: string;
    like: boolean;
  }) => {
    if (!session) {
      openSignInWarningModal();
      return;
    }

    likeMutation.mutate({ threadId, commentId, like });
  };

  return (
    <Tabs.Panel value="comments" className={classes["tab-content"]}>
      {!isCommentsFetching && comments?.pages[0].length === 0 ? (
        <CommentPrompt isOwnProfile={session?.user.username === username} />
      ) : (
        <InfiniteScroll
          onLoadMore={fetchNextCommentsPage}
          hasNext={hasNextCommentsPage}
          loading={isCommentsFetching}
        >
          <div className={classes["tab-content-container"]}>
            {comments?.pages.map((page) =>
              page.map((comment) => (
                <UserCommentItem
                  key={comment.id}
                  comment={comment}
                  onLike={handleLike}
                />
              )),
            )}

            {isCommentsFetching && <ThreadsSkeleton />}
          </div>
        </InfiniteScroll>
      )}
    </Tabs.Panel>
  );
}
