"use client";

import { useRouter } from "next/navigation";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { spotlight } from "@mantine/spotlight";
import { Button, Card, Kbd, Text, Title } from "@mantine/core";
import { IconMail, IconSearch } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { likeLetter, unlikeLetter } from "@/services/letter";
import { lettersInfiniteOptions } from "@/app/(main)/(core)/letters/options";
import InfiniteScroll from "@/components/infinite-scroll";
import SignInWarningModal from "@/components/sign-in-warning-modal";
import LetterItem from "./letter-item";
import SearchSpotlight from "./search-spotlight";
import { LettersSkeleton } from "./letters-skeleton";
import { setLikeLetterQueryData } from "@/app/(main)/(core)/letters/set-query-data";
import classes from "./letters.module.css";

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
  } = useInfiniteQuery(lettersInfiniteOptions);

  const handleClickSubmitPost = () => {
    if (!session) {
      signInWarningModalHandler.open();
      return;
    }

    router.push("/letters/submit");
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
    <div className={classes.container}>
      <div className={classes["letters-header"]}>
        <Title>Letters</Title>

        <Text c="dimmed">
          Longer conversations. Write a new letter or respond to one that
          resonates.
        </Text>
      </div>

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
          rightSection={<IconMail size="1em" />}
          onClick={handleClickSubmitPost}
        >
          Write a letter
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
        <div className={classes.letters}>
          {postsData?.pages
            .reduce((acc, page) => acc.concat(page))
            .map((post) => (
              <LetterItem key={post.id} post={post} onLike={handleLike} />
            ))}

          {isFetchingPosts && <LettersSkeleton />}
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
