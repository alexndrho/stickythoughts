'use client';

import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Tabs } from '@mantine/core';
import { IconNote } from '@tabler/icons-react';

import { type authClient } from '@/lib/auth-client';
import { userUsernameRepliesInfiniteOptions } from '../options';
import { setLikeLetterReplyQueryData } from '../../letters/set-query-data';
import { likeLetterReply, unlikeLetterReply } from '@/services/letter';
import InfiniteScroll from '@/components/infinite-scroll';
import { LettersSkeleton } from '@/components/letters/letters-skeleton';
import EmptyState from '@/components/prompt/empty-state';
import UserReplyItem from './user-reply-item';
import classes from './user.module.css';

export interface RepliesTabProps {
  username: string;
  session: ReturnType<typeof authClient.useSession>['data'];
  openSignInWarningModal: () => void;
  isActive: boolean;
}

export default function RepliesTab({
  username,
  session,
  isActive,
  openSignInWarningModal,
}: RepliesTabProps) {
  const {
    data: replies,
    isFetching: isRepliesFetching,
    fetchNextPage: fetchNextRepliesPage,
    hasNextPage: hasNextRepliesPage,
  } = useInfiniteQuery({
    ...userUsernameRepliesInfiniteOptions(username),
    enabled: isActive,
  });

  const likeMutation = useMutation({
    mutationFn: async ({
      letterId,
      replyId,
      like,
    }: {
      letterId: string;
      replyId: string;
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

      return { letterId, replyId, like };
    },
    onSuccess: (data) => {
      setLikeLetterReplyQueryData({
        letterId: data.letterId,
        replyId: data.replyId,
        authorUsername: username,
        like: data.like,
      });
    },
  });

  const handleLike = ({
    letterId,
    replyId,
    like,
  }: {
    letterId: string;
    replyId: string;
    like: boolean;
  }) => {
    if (!session) {
      openSignInWarningModal();
      return;
    }

    likeMutation.mutate({ letterId, replyId, like });
  };

  return (
    <Tabs.Panel value="replies" className={classes['tab-content']}>
      {!isRepliesFetching && replies?.pages[0].length === 0 ? (
        <EmptyState
          icon={IconNote}
          title={
            session?.user.username === username
              ? "You haven't created any replies yet"
              : "This user hasn't created any replies yet"
          }
        />
      ) : (
        <InfiniteScroll
          onLoadMore={fetchNextRepliesPage}
          hasNext={hasNextRepliesPage}
          loading={isRepliesFetching}
        >
          <section className={classes['tab-content-container']}>
            {replies?.pages.map((page) =>
              page.map((reply) => (
                <UserReplyItem key={reply.id} reply={reply} onLike={handleLike} />
              )),
            )}

            {isRepliesFetching && <LettersSkeleton />}
          </section>
        </InfiniteScroll>
      )}
    </Tabs.Panel>
  );
}
