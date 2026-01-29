"use client";

import { Tabs } from "@mantine/core";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { userUsernameLikedThreadsInfiniteOptions } from "@/app/(main)/(core)/user/options";
import { setLikeThreadQueryData } from "@/app/(main)/(core)/threads/set-query-data";
import ThreadItem from "../../threads/thread-item";
import { ThreadsSkeleton } from "../../threads/threads-skeleton";
import LikesPrompt from "./likes-prompt";
import { likeThread, unlikeThread } from "@/services/thread";
import InfiniteScroll from "@/components/infinite-scroll";
import classes from "./user.module.css";

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

  const canFetchLikedThreads =
    !isPrivate || sessionData?.user.username === username;

  const {
    data: likedThreads,
    isFetching: isLikedThreadsFetching,
    fetchNextPage: fetchNextLikedThreadsPage,
    hasNextPage: hasNextLikedThreadsPage,
  } = useInfiniteQuery({
    ...userUsernameLikedThreadsInfiniteOptions(username),
    enabled: isActive && canFetchLikedThreads,
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
        threadId: data.id,
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
    <Tabs.Panel value="likes" className={classes["tab-content"]}>
      {(!canFetchLikedThreads && !isSessionPending) ||
      (!isLikedThreadsFetching && likedThreads?.pages?.[0]?.length === 0) ? (
        <LikesPrompt
          isOwnProfile={sessionData?.user.username === username}
          isPrivate={isPrivate}
        />
      ) : (
        <InfiniteScroll
          onLoadMore={() => {
            fetchNextLikedThreadsPage();
          }}
          hasNext={hasNextLikedThreadsPage}
          loading={isLikedThreadsFetching}
        >
          <div className={classes["tab-content-container"]}>
            {likedThreads?.pages.map((page) =>
              page.map((thread) => (
                <ThreadItem key={thread.id} post={thread} onLike={handleLike} />
              )),
            )}

            {isLikedThreadsFetching && <ThreadsSkeleton />}
          </div>
        </InfiniteScroll>
      )}
    </Tabs.Panel>
  );
}
