'use client';

import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Tabs } from '@mantine/core';

import type { authClient } from '@/lib/auth-client';
import LetterItem from '@/components/letters/letter-item';
import { userUsernameLettersInfiniteOptions } from '@/app/(main)/(core)/user/options';
import { likeLetter, unlikeLetter } from '@/services/letter';
import { setLikeLetterQueryData } from '@/app/(main)/(core)/letters/set-query-data';
import { LettersSkeleton } from '@/components/letters/letters-skeleton';
import LetterPrompt from './letter-prompt';
import InfiniteScroll from '@/components/infinite-scroll';
import classes from './user.module.css';

interface LettersTabProps {
  username: string;
  session: ReturnType<typeof authClient.useSession>['data'];
  openSignInWarningModal: () => void;
  isActive: boolean;
}

export default function Letters({
  username,
  session,
  openSignInWarningModal,
  isActive,
}: LettersTabProps) {
  const {
    data: letters,
    isFetching: isLettersFetching,
    fetchNextPage: fetchNextLettersPage,
    hasNextPage: hasNextLettersPage,
  } = useInfiniteQuery({
    ...userUsernameLettersInfiniteOptions(username),
    enabled: isActive,
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
    <Tabs.Panel value="letters" className={classes['tab-content']}>
      {!isLettersFetching && letters?.pages[0].length === 0 ? (
        <LetterPrompt isOwnProfile={session?.user?.username === username} />
      ) : (
        <InfiniteScroll
          onLoadMore={() => {
            fetchNextLettersPage();
          }}
          hasNext={hasNextLettersPage}
          loading={isLettersFetching}
        >
          <section className={classes['tab-content-container']}>
            {letters?.pages.map((page) =>
              page.map((letter) => (
                <LetterItem key={letter.id} post={letter} onLike={handleLike} />
              )),
            )}

            {isLettersFetching && <LettersSkeleton />}
          </section>
        </InfiniteScroll>
      )}
    </Tabs.Panel>
  );
}
