"use client";

import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Tabs } from "@mantine/core";

import type { authClient } from "@/lib/auth-client";
import ThreadItem from "../../threads/ThreadItem";
import { userUsernameThreadsInfiniteOptions } from "@/app/(main)/(core)/user/options";
import { likeThread, unlikeThread } from "@/services/thread";
import { setLikeThreadQueryData } from "@/app/(main)/(core)/threads/set-query-data";
import { ThreadsSkeleton } from "../../threads/ThreadsSkeleton";
import EmptyThreadPrompt from "./EmptyThreadPrompt";
import InfiniteScroll from "@/components/InfiniteScroll";
import classes from "./user.module.css";

interface ThreadsTabProps {
  username: string;
  session: ReturnType<typeof authClient.useSession>["data"];
  openSignInWarningModal: () => void;
  isActive: boolean;
}

export default function Threads({
  username,
  session,
  openSignInWarningModal,
  isActive,
}: ThreadsTabProps) {
  const {
    data: threads,
    isFetching: isThreadsFetching,
    fetchNextPage: fetchNextThreadsPage,
    hasNextPage: hasNextThreadsPage,
  } = useInfiniteQuery({
    ...userUsernameThreadsInfiniteOptions(username),
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
    <Tabs.Panel value="threads" className={classes["tab-content"]}>
      <InfiniteScroll
        onLoadMore={() => {
          fetchNextThreadsPage();
        }}
        hasNext={hasNextThreadsPage}
        loading={isThreadsFetching}
      >
        <div className={classes["tab-content-container"]}>
          {threads?.pages[0].length !== 0 ? (
            threads?.pages.map((page) =>
              page.map((thread) => (
                <ThreadItem key={thread.id} post={thread} onLike={handleLike} />
              )),
            )
          ) : (
            <EmptyThreadPrompt
              isCurrentUser={session?.user.username === username}
            />
          )}

          {isThreadsFetching && <ThreadsSkeleton />}
        </div>
      </InfiniteScroll>
    </Tabs.Panel>
  );
}
