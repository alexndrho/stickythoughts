"use client";

import { Flex, Tabs } from "@mantine/core";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { userLikedThreadsInfiniteOptions } from "@/app/(main)/(core)/user/options";
import { setLikeThreadQueryData } from "@/app/(main)/(core)/threads/set-query-data";
import ThreadItem from "../../threads/ThreadItem";
import { ThreadsSkeleton } from "../../threads/ThreadsSkeleton";
import { likeThread, unlikeThread } from "@/services/thread";
import InfiniteScroll from "@/components/InfiniteScroll";

export interface LikesTabProps {
  username: string;
  session: ReturnType<typeof authClient.useSession>["data"];
  openSignInWarningModal: () => void;
  isActive: boolean;
}

export default function LikesTab({
  username,
  session,
  openSignInWarningModal,
  isActive,
}: LikesTabProps) {
  const {
    data: likedThreads,
    isFetching: isLikedThreadsFetching,
    fetchNextPage: fetchNextLikedThreadsPage,
    hasNextPage: hasNextLikedThreadsPage,
  } = useInfiniteQuery({
    ...userLikedThreadsInfiniteOptions(username),
    enabled: isActive,
  });

  const likeMutation = useMutation({
    mutationFn: async ({ id, like }: { id: string; like: boolean }) => {
      if (like) {
        await likeThread(id);
      } else {
        await unlikeThread(id);
      }

      return { id, like };
    },

    onSuccess: (data) => {
      setLikeThreadQueryData({
        username,
        threadId: data.id,
        like: data.like,
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
    <Tabs.Panel value="likes" py="md">
      <InfiniteScroll
        onLoadMore={() => {
          fetchNextLikedThreadsPage();
        }}
        hasNext={hasNextLikedThreadsPage}
        loading={isLikedThreadsFetching}
      >
        <Flex direction="column" gap="md">
          {likedThreads?.pages.map((page) =>
            page.map((thread) => (
              <ThreadItem key={thread.id} post={thread} onLike={handleLike} />
            )),
          )}

          {isLikedThreadsFetching && <ThreadsSkeleton />}
        </Flex>
      </InfiniteScroll>
    </Tabs.Panel>
  );
}
