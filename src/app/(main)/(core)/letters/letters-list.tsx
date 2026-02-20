'use client';

import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';

import { authClient } from '@/lib/auth-client';
import { likeLetter, unlikeLetter } from '@/services/letter';
import { lettersInfiniteOptions } from '@/app/(main)/(core)/letters/options';
import InfiniteScroll from '@/components/infinite-scroll';
import SignInWarningModal from '@/components/sign-in-warning-modal';
import LetterItem from '@/components/letters/letter-item';
import { LettersSkeleton } from '@/components/letters/letters-skeleton';
import { setLikeLetterQueryData } from '@/app/(main)/(core)/letters/set-query-data';
import type { Letter } from '@/types/letter';
import classes from './letters.module.css';

export default function LettersList({ initialData }: { initialData?: Letter[] }) {
  const { data: session } = authClient.useSession();
  const [signInWarningModalOpened, signInWarningModalHandler] = useDisclosure(false);

  const {
    data: postsData,
    isFetching: isFetchingPosts,
    fetchNextPage: fetchNextPostsPage,
    hasNextPage: hasNextPostsPage,
  } = useInfiniteQuery({
    ...lettersInfiniteOptions,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
  });

  const handleLikeMutation = useMutation({
    mutationFn: async ({
      id,
      like,
      authorUsername,
    }: {
      id: string;
      like: boolean;
      authorUsername: string;
    }) => {
      if (like) {
        await likeLetter(id);
      } else {
        await unlikeLetter(id);
      }

      return { letterId: id, like, authorUsername };
    },

    onSuccess: (data) => {
      setLikeLetterQueryData({
        ...data,
      });
    },
  });

  const handleLike = ({
    id,
    like,
    authorUsername,
  }: {
    id: string;
    like: boolean;
    authorUsername: string;
  }) => {
    if (!session) {
      signInWarningModalHandler.open();
      return;
    }

    handleLikeMutation.mutate({ id, like, authorUsername });
  };

  return (
    <>
      <InfiniteScroll
        onLoadMore={fetchNextPostsPage}
        hasNext={hasNextPostsPage}
        loading={isFetchingPosts}
      >
        <section className={classes.letters}>
          {postsData?.pages
            .reduce((acc, page) => acc.concat(page))
            .map((post) => (
              <LetterItem
                key={post.id}
                post={post}
                likeLoading={
                  handleLikeMutation.isPending && handleLikeMutation.variables?.id === post.id
                }
                onLike={handleLike}
              />
            ))}

          {isFetchingPosts && <LettersSkeleton />}
        </section>
      </InfiniteScroll>

      {!session && (
        <SignInWarningModal
          opened={signInWarningModalOpened}
          onClose={signInWarningModalHandler.close}
        />
      )}
    </>
  );
}
