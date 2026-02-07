"use client";

import { useState } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Center, Loader } from "@mantine/core";

import { type authClient } from "@/lib/auth-client";
import { letterRepliesInfiniteOptions } from "@/app/(main)/(core)/letters/options";
import { likeLetterReply, unlikeLetterReply } from "@/services/letter";
import { setLikeLetterReplyQueryData } from "@/app/(main)/(core)/letters/set-query-data";
import InfiniteScroll from "@/components/infinite-scroll";
import ReplyItem from "./reply-item";
import { type LetterReplyType } from "@/types/letter";
import classes from "./letter.module.css";
import DeleteReplyModal from "./delete-reply-modal";

export interface RepliesProps {
  letterId: string;
  session: ReturnType<typeof authClient.useSession>["data"];
  onOpenSignInWarningModal: () => void;
}

export default function Replies({
  letterId,
  session,
  onOpenSignInWarningModal,
}: RepliesProps) {
  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    isFetching: isFetchingReplies,
    isRefetching: isRefetchingReplies,
    fetchNextPage: fetchNextRepliesPage,
    hasNextPage: hasNextRepliesPage,
  } = useInfiniteQuery(letterRepliesInfiniteOptions(letterId));

  const [deletingReply, setDeletingReply] = useState<LetterReplyType | null>(
    null,
  );

  const replyLikeMutation = useMutation({
    mutationFn: async ({
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
      if (like) {
        await likeLetterReply({
          letterId,
          replyId,
        });
      } else {
        await unlikeLetterReply({
          letterId,
          replyId,
        });
      }

      return { replyId, authorUsername, like };
    },
    onSuccess: (data) => {
      setLikeLetterReplyQueryData({
        ...data,
        letterId,
      });
    },
  });

  const handleLike = ({
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
    if (!session) {
      onOpenSignInWarningModal();

      return;
    }

    replyLikeMutation.mutate({
      letterId,
      replyId,
      authorUsername,
      like,
    });
  };

  const handleDeleteReplyModalOpen = (reply: LetterReplyType) => {
    setDeletingReply(reply);
  };

  const handleDeleteReplyModalClose = () => {
    setDeletingReply(null);
  };

  return (
    <InfiniteScroll
      onLoadMore={fetchNextRepliesPage}
      hasNext={hasNextRepliesPage}
      loading={isFetchingReplies || isRefetchingReplies}
    >
      <div className={classes.replies}>
        {repliesData?.pages
          .reduce((acc, page) => acc.concat(page))
          .map((reply) => (
            <ReplyItem
              key={reply.id}
              session={session}
              reply={reply}
              likeLoading={
                replyLikeMutation.isPending &&
                replyLikeMutation.variables?.replyId === reply.id
              }
              onLike={() =>
                handleLike({
                  letterId: reply.letterId,
                  replyId: reply.id,
                  authorUsername: reply.author?.username,
                  like: !reply.likes.liked,
                })
              }
              onDelete={() => handleDeleteReplyModalOpen(reply)}
            />
          ))}

        {isFetchingReplies && (
          <Center mt="lg" h={isLoadingReplies ? 250 : undefined}>
            <Loader />
          </Center>
        )}
      </div>

      <DeleteReplyModal
        letterId={letterId}
        reply={deletingReply}
        opened={!!deletingReply}
        onClose={handleDeleteReplyModalClose}
      />
    </InfiniteScroll>
  );
}
