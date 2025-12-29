"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { Avatar, Tabs, Text, Title } from "@mantine/core";
import {
  IconHeartFilled,
  IconMessage,
  IconMessageCircle,
} from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import ThreadsTab from "./ThreadsTab";
import LikesTab from "./LikesTab";
import CommentsTab from "./CommentsTab";
import SignInWarningModal from "@/components/SignInWarningModal";
import { useSuspenseQuery } from "@tanstack/react-query";
import { userUsernameOptions } from "../options";
import classes from "./user.module.css";

export interface ContentProps {
  username: string;
}

export default function Content({ username }: ContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();

  const [signInWarningModalOpened, signInWarningModalHandler] =
    useDisclosure(false);

  const { data: user } = useSuspenseQuery(userUsernameOptions(username));

  const currentTab = useMemo(() => {
    const tab = searchParams.get("tab");
    if (tab === "threads" || tab === "comments" || tab === "likes") return tab;
    return "threads";
  }, [searchParams]);

  const setTab = (value: string | null) => {
    const next = value ?? "threads";
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <div className={classes.header}>
        <Avatar size="xl" src={user.image} />

        <div className={classes.header__info}>
          <Title size="h2">{user.name || user.username}</Title>

          <Text size="lg">@{user.username}</Text>

          {user.bio && (
            <Text size="sm" className={classes.header__bio}>
              {user.bio}
            </Text>
          )}
        </div>
      </div>

      <Tabs variant="outline" value={currentTab} onChange={setTab}>
        <Tabs.List>
          <Tabs.Tab value="threads" leftSection={<IconMessage size="1em" />}>
            Threads
          </Tabs.Tab>

          <Tabs.Tab
            value="comments"
            leftSection={<IconMessageCircle size="1em" />}
          >
            Comments
          </Tabs.Tab>

          <Tabs.Tab value="likes" leftSection={<IconHeartFilled size="1em" />}>
            Likes
          </Tabs.Tab>
        </Tabs.List>

        <ThreadsTab
          username={user.username}
          session={session}
          isActive={currentTab === "threads"}
          openSignInWarningModal={signInWarningModalHandler.open}
        />

        <CommentsTab
          username={user.username}
          session={session}
          isActive={currentTab === "comments"}
          openSignInWarningModal={signInWarningModalHandler.open}
        />

        <LikesTab
          username={user.username}
          session={session}
          isActive={currentTab === "likes"}
          openSignInWarningModal={signInWarningModalHandler.open}
        />
      </Tabs>

      {!session && (
        <SignInWarningModal
          opened={signInWarningModalOpened}
          onClose={signInWarningModalHandler.close}
        />
      )}
    </>
  );
}
