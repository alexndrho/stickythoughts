"use client";

import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Center, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";

import { type authClient } from "@/lib/auth-client";
import { threadCommentsInfiniteOptions } from "@/app/(main)/(core)/threads/options";
import {
  deleteThreadComment,
  likeThreadComment,
  unlikeThreadComment,
} from "@/services/thread";
import {
  setDeleteThreadCommentQueryData,
  setLikeThreadCommentQueryData,
} from "@/app/(main)/(core)/threads/set-query-data";
import InfiniteScroll from "@/components/InfiniteScroll";
import CommentItem from "./CommentItem";
import classes from "./thread.module.css";

export interface CommentsProps {
  threadId: string;
  session: ReturnType<typeof authClient.useSession>["data"];
  threadAuthor: string;
  dateNow: Date;
  onOpenSignInWarningModal: () => void;
}

export default function Comments({
  threadId,
  session,
  threadAuthor,
  dateNow,
  onOpenSignInWarningModal,
}: CommentsProps) {
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    isFetching: isFetchingComments,
    isRefetching: isRefetchingComments,
    fetchNextPage: fetchNextCommentsPage,
    hasNextPage: hasNextCommentsPage,
  } = useInfiniteQuery(threadCommentsInfiniteOptions(threadId));

  const deleteMutation = useMutation({
    mutationFn: async ({
      threadId,
      commentId,
    }: {
      threadId: string;
      commentId: string;
    }) => {
      await deleteThreadComment({
        threadId,
        commentId,
      });

      return { threadId, commentId };
    },
    onSuccess: (data) => {
      setDeleteThreadCommentQueryData({
        threadId: data.threadId,
        commentId: data.commentId,
      });

      notifications.show({
        title: "Comment deleted",
        message: "The comment has been successfully deleted.",
        icon: <IconTrash size="1em" />,
      });
    },
  });

  const commentLikeMutation = useMutation({
    mutationFn: async ({
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

      return { commentId, username, like };
    },
    onSuccess: (data) => {
      setLikeThreadCommentQueryData({
        threadId,
        commentId: data.commentId,
        username: data.username,
        like: data.like,
      });
    },
  });

  const handleLike = ({
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
    if (!session) {
      onOpenSignInWarningModal();

      return;
    }

    commentLikeMutation.mutate({
      threadId,
      commentId,
      username,
      like,
    });
  };

  return (
    <InfiniteScroll
      onLoadMore={fetchNextCommentsPage}
      hasNext={hasNextCommentsPage}
      loading={isFetchingComments || isRefetchingComments}
    >
      <div className={classes.comments}>
        {commentsData?.pages
          .reduce((acc, page) => acc.concat(page))
          .map((comment) => (
            <CommentItem
              key={comment.id}
              session={session}
              comment={comment}
              dateNow={dateNow}
              isThreadOwner={threadAuthor === comment.author.id}
              onLike={handleLike}
              onDelete={deleteMutation.mutate}
            />
          ))}

        {isFetchingComments && (
          <Center mt="lg" h={isLoadingComments ? 250 : undefined}>
            <Loader />
          </Center>
        )}
      </div>
    </InfiniteScroll>
  );
}
