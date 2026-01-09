"use client";

import { useState } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Center, Loader } from "@mantine/core";

import { type authClient } from "@/lib/auth-client";
import { threadCommentsInfiniteOptions } from "@/app/(main)/(core)/threads/options";
import { likeThreadComment, unlikeThreadComment } from "@/services/thread";
import { setLikeThreadCommentQueryData } from "@/app/(main)/(core)/threads/set-query-data";
import InfiniteScroll from "@/components/InfiniteScroll";
import CommentItem from "./CommentItem";
import { type ThreadCommentType } from "@/types/thread";
import classes from "./thread.module.css";
import DeleteCommentModal from "./DeleteCommentModal";

export interface CommentsProps {
  threadId: string;
  session: ReturnType<typeof authClient.useSession>["data"];
  threadAuthor: string;
  onOpenSignInWarningModal: () => void;
}

export default function Comments({
  threadId,
  session,
  threadAuthor,
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

  const [deletingComment, setDeletingComment] =
    useState<ThreadCommentType | null>(null);

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

  const handleDeleteCommentModalOpen = (comment: ThreadCommentType) => {
    setDeletingComment(comment);
  };

  const handleDeleteCommentModalClose = () => {
    setDeletingComment(null);
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
              isThreadOwner={threadAuthor === comment.author.id}
              onLike={handleLike}
              onDelete={() => handleDeleteCommentModalOpen(comment)}
            />
          ))}

        {isFetchingComments && (
          <Center mt="lg" h={isLoadingComments ? 250 : undefined}>
            <Loader />
          </Center>
        )}
      </div>

      <DeleteCommentModal
        threadId={threadId}
        comment={deletingComment}
        opened={!!deletingComment}
        onClose={handleDeleteCommentModalClose}
      />
    </InfiniteScroll>
  );
}
