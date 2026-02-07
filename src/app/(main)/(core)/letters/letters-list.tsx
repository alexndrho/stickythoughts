"use client";

import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { Button, Card, Text } from "@mantine/core";

import { authClient } from "@/lib/auth-client";
import { likeLetter, unlikeLetter } from "@/services/letter";
import { lettersInfiniteOptions } from "@/app/(main)/(core)/letters/options";
import InfiniteScroll from "@/components/infinite-scroll";
import SignInWarningModal from "@/components/sign-in-warning-modal";
import LetterItem from "./letter-item";
import { LettersSkeleton } from "./letters-skeleton";
import { setLikeLetterQueryData } from "@/app/(main)/(core)/letters/set-query-data";
import classes from "./letters.module.css";

export default function LettersList() {
  const { data: session } = authClient.useSession();
  const [signInWarningModalOpened, signInWarningModalHandler] =
    useDisclosure(false);

  const {
    data: postsData,
    isFetching: isFetchingPosts,
    fetchNextPage: fetchNextPostsPage,
    hasNextPage: hasNextPostsPage,
  } = useInfiniteQuery(lettersInfiniteOptions);

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
      {!session && (
        <Card withBorder className={classes["sign-in-card"]}>
          <Text
            size="xs"
            c="blue"
            className={classes["sign-in-prompt__eyebrow"]}
          >
            New here?
          </Text>

          <Text size="lg" className={classes["sign-in-prompt__title"]}>
            Write a letter or respond to one
          </Text>

          <Text className={classes["sign-in-prompt__copy"]}>
            Sign in to post or reply. You can also continue anonymously and
            decide later whether to keep the account for creating.
          </Text>

          <div className={classes["sign-in-prompt__actions"]}>
            <Button component="a" href="/sign-in" variant="default">
              Sign in
            </Button>
          </div>
        </Card>
      )}

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
                  handleLikeMutation.isPending &&
                  handleLikeMutation.variables?.id === post.id
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
