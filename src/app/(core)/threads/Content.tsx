"use client";

import { useRouter } from "next/navigation";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { spotlight } from "@mantine/spotlight";
import { Box, Button, Flex, Pill } from "@mantine/core";
import { IconMessage, IconSearch } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { likeThread, unlikeThread } from "@/services/thread";
import { threadInfiniteOptions } from "@/app/(core)/threads/options";
import InfiniteScroll from "@/components/InfiniteScroll";
import SignInWarningModal from "@/components/SignInWarningModal";
import ThreadItem from "./ThreadItem";
import SearchSpotlight from "./SearchSpotlight";
import { ThreadsSkeleton } from "./ThreadsSkeleton";
import { setLikeThreadQueryData } from "@/app/(core)/threads/set-query-data";
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
  } = useInfiniteQuery(threadInfiniteOptions);

  const handleClickSubmitPost = () => {
    if (!session) {
      signInWarningModalHandler.open();
      return;
    }

    router.push("/threads/submit");
  };

  const handleLikeMutation = useMutation({
    mutationFn: async ({ id, like }: { id: string; like: boolean }) => {
      if (like) {
        await likeThread(id);
      } else {
        await unlikeThread(id);
      }

      return { threadId: id, like };
    },

    onSuccess: (data) => {
      setLikeThreadQueryData(data);
    },
  });

  const handleLike = ({ id, like }: { id: string; like: boolean }) => {
    if (!session) {
      signInWarningModalHandler.open();
      return;
    }

    handleLikeMutation.mutate({ id, like });
  };

  return (
    <Box my="md" w="100%">
      <Flex w="100%" mb="md" gap="md">
        <Button
          flex={1}
          variant="default"
          justify="space-between"
          c="var(--mantine-color-dimmed)"
          leftSection={<IconSearch size="1em" />}
          rightSection={<Pill>Ctrl + K</Pill>}
          onClick={spotlight.open}
          // styles={{
          //   label: { flex: 1 },
          // }}
          classNames={{
            label: classes["search-btn__label"],
          }}
          aria-label="Open search"
        >
          Search...
        </Button>

        <Button
          rightSection={<IconMessage size="1em" />}
          onClick={handleClickSubmitPost}
        >
          Submit a thread
        </Button>
      </Flex>

      <InfiniteScroll
        onLoadMore={fetchNextPostsPage}
        hasNext={hasNextPostsPage}
        loading={isFetchingPosts}
      >
        <Flex direction="column" gap="md">
          {postsData?.pages
            .reduce((acc, page) => acc.concat(page))
            .map((post) => (
              <ThreadItem key={post.id} post={post} onLike={handleLike} />
            ))}

          {isFetchingPosts && <ThreadsSkeleton />}
        </Flex>
      </InfiniteScroll>

      <SearchSpotlight />

      {!session && (
        <SignInWarningModal
          opened={signInWarningModalOpened}
          onClose={signInWarningModalHandler.close}
        />
      )}
    </Box>
  );
}
