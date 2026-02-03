"use client";

import { useRouter } from "next/navigation";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { spotlight } from "@mantine/spotlight";
import { Button, Card, Kbd, Text } from "@mantine/core";
import { IconMessage, IconSearch } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { likeThread, unlikeThread } from "@/services/thread";
import { threadsInfiniteOptions } from "@/app/(main)/(core)/threads/options";
import InfiniteScroll from "@/components/infinite-scroll";
import SignInWarningModal from "@/components/sign-in-warning-modal";
import ThreadItem from "./thread-item";
import SearchSpotlight from "./search-spotlight";
import { ThreadsSkeleton } from "./threads-skeleton";
import { setLikeThreadQueryData } from "@/app/(main)/(core)/threads/set-query-data";
import classes from "./threads.module.css";

export default function Content() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const [signInWarningModalOpened, signInWarningModalHandler] =
    useDisclosure(false);

  const {
    data: postsData,
    isFetching: isFetchingPosts,
    fetchNextPage: fetchNextPostsPage,
    hasNextPage: hasNextPostsPage,
  } = useInfiniteQuery(threadsInfiniteOptions);

  const handleClickSubmitPost = () => {
    if (!session) {
      signInWarningModalHandler.open();
      return;
    }

    router.push("/threads/submit");
  };

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
        await likeThread(id);
      } else {
        await unlikeThread(id);
      }

      return { threadId: id, like, authorUsername };
    },

    onSuccess: (data) => {
      setLikeThreadQueryData({
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
    <div className={classes.container}>
      <div className={classes["actions-bar"]}>
        <Button
          variant="default"
          leftSection={<IconSearch size="1em" />}
          rightSection={<Kbd>t</Kbd>}
          onClick={spotlight.open}
          aria-label="Open search"
          classNames={{
            root: classes["actions-bar__search-btn"],
            label: classes["actions-bar__search-btn__label"],
          }}
        >
          Search...
        </Button>

        <Button
          rightSection={<IconMessage size="1em" />}
          onClick={handleClickSubmitPost}
        >
          Submit a thread
        </Button>
      </div>

      {!session && (
        <Card withBorder className={classes["sign-in-card"]}>
          <Text
            size="sm"
            c="blue"
            className={classes["sign-in-prompt__eyebrow"]}
          >
            New here?
          </Text>

          <Text size="lg" className={classes["sign-in-prompt__title"]}>
            Start a thread or join the conversation
          </Text>

          <Text className={classes["sign-in-prompt__copy"]}>
            Sign in to post or comment. You can also continue anonymously and
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
        <div className={classes.threads}>
          {postsData?.pages
            .reduce((acc, page) => acc.concat(page))
            .map((post) => (
              <ThreadItem key={post.id} post={post} onLike={handleLike} />
            ))}

          {isFetchingPosts && <ThreadsSkeleton />}
        </div>
      </InfiniteScroll>

      <SearchSpotlight />

      {!session && (
        <SignInWarningModal
          opened={signInWarningModalOpened}
          onClose={signInWarningModalHandler.close}
        />
      )}
    </div>
  );
}
