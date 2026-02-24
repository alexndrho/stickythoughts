'use client';

import { useState } from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Center, Loader } from '@mantine/core';
import { IconNote } from '@tabler/icons-react';

import { type authClient } from '@/lib/auth-client';
import { letterRepliesInfiniteOptions } from '@/app/(main)/(core)/letters/options';
import { likeLetterReply, unlikeLetterReply } from '@/services/letter';
import { setLikeLetterReplyQueryData } from '@/app/(main)/(core)/letters/set-query-data';
import InfiniteScroll from '@/components/infinite-scroll';
import EmptyState from '@/components/prompt/empty-state';
import ReplyItem from './reply-item';
import DeleteReplyModal from './delete-reply-modal';
import { type LetterReply } from '@/types/letter';
import classes from './letter.module.css';

export interface RepliesProps {
  letterId: string;
  session: ReturnType<typeof authClient.useSession>['data'];
  onOpenSignInWarningModal: () => void;
  hasReplies?: boolean;
}

export default function Replies({
  letterId,
  session,
  onOpenSignInWarningModal,
  hasReplies,
}: RepliesProps) {
  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    isFetching: isFetchingReplies,
    isRefetching: isRefetchingReplies,
    fetchNextPage: fetchNextRepliesPage,
    hasNextPage: hasNextRepliesPage,
  } = useInfiniteQuery({ ...letterRepliesInfiniteOptions(letterId), enabled: hasReplies ?? true });

  const [deletingReply, setDeletingReply] = useState<LetterReply | null>(null);

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

  const handleDeleteReplyModalOpen = (reply: LetterReply) => {
    setDeletingReply(reply);
  };

  const handleDeleteReplyModalClose = () => {
    setDeletingReply(null);
  };

  const hasNoReplies = !hasReplies || (!isFetchingReplies && repliesData?.pages?.[0]?.length === 0);

  if (hasNoReplies) {
    return <EmptyState mt="xl" icon={IconNote} title="Be the first to reply to this letter" />;
  }

  return (
    <InfiniteScroll
      onLoadMore={fetchNextRepliesPage}
      hasNext={hasNextRepliesPage}
      loading={isFetchingReplies || isRefetchingReplies}
    >
      <section className={classes.replies}>
        {repliesData?.pages
          .reduce((acc, page) => acc.concat(page))
          .map((reply) => (
            <ReplyItem
              key={reply.id}
              session={session}
              reply={reply}
              likeLoading={
                replyLikeMutation.isPending && replyLikeMutation.variables?.replyId === reply.id
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
      </section>

      <DeleteReplyModal
        letterId={letterId}
        reply={deletingReply}
        opened={!!deletingReply}
        onClose={handleDeleteReplyModalClose}
      />
    </InfiniteScroll>
  );
}
