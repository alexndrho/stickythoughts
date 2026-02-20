'use client';

import { Tabs } from '@mantine/core';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth-client';
import { userUsernameLikedLettersInfiniteOptions } from '@/app/(main)/(core)/user/options';
import { setLikeLetterQueryData } from '@/app/(main)/(core)/letters/set-query-data';
import LetterItem from '@/components/letters/letter-item';
import { LettersSkeleton } from '@/components/letters/letters-skeleton';
import LikesPrompt from './likes-prompt';
import { likeLetter, unlikeLetter } from '@/services/letter';
import InfiniteScroll from '@/components/infinite-scroll';
import classes from './user.module.css';

export interface LikesTabProps {
  username: string;
  session: ReturnType<typeof authClient.useSession>;
  isPrivate: boolean;
  openSignInWarningModal: () => void;
  isActive: boolean;
}

export default function LikesTab({
  username,
  session,
  isPrivate,
  openSignInWarningModal,
  isActive,
}: LikesTabProps) {
  const { data: sessionData, isPending: isSessionPending } = session;

  const canFetchLikedLetters = !isPrivate || sessionData?.user.username === username;

  const {
    data: likedLetters,
    isFetching: isLikedLettersFetching,
    fetchNextPage: fetchNextLikedLettersPage,
    hasNextPage: hasNextLikedLettersPage,
  } = useInfiniteQuery({
    ...userUsernameLikedLettersInfiniteOptions(username),
    enabled: isActive && canFetchLikedLetters,
  });

  const likeMutation = useMutation({
    mutationFn: async ({ id, like }: { id: string; like: boolean }) => {
      if (like) {
        await likeLetter(id);
      } else {
        await unlikeLetter(id);
      }

      return { id, like };
    },

    onSuccess: (data) => {
      setLikeLetterQueryData({
        letterId: data.id,
        like: data.like,
        authorUsername: username,
      });
    },
  });

  const handleLike = ({ id, like }: { id: string; like: boolean }) => {
    if (!session) {
      openSignInWarningModal();
      return;
    }

    likeMutation.mutate({ id, like });
  };

  return (
    <Tabs.Panel value="likes" className={classes['tab-content']}>
      {(!canFetchLikedLetters && !isSessionPending) ||
      (!isLikedLettersFetching && likedLetters?.pages?.[0]?.length === 0) ? (
        <LikesPrompt isOwnProfile={sessionData?.user.username === username} isPrivate={isPrivate} />
      ) : (
        <InfiniteScroll
          onLoadMore={() => {
            fetchNextLikedLettersPage();
          }}
          hasNext={hasNextLikedLettersPage}
          loading={isLikedLettersFetching}
        >
          <section className={classes['tab-content-container']}>
            {likedLetters?.pages.map((page) =>
              page.map((letter) => (
                <LetterItem key={letter.id} post={letter} onLike={handleLike} />
              )),
            )}

            {isLikedLettersFetching && <LettersSkeleton />}
          </section>
        </InfiniteScroll>
      )}
    </Tabs.Panel>
  );
}
