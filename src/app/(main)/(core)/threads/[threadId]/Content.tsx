"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Button,
  Center,
  Group,
  Menu,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { threadOptions } from "../options";
import { setLikeThreadQueryData } from "@/app/(main)/(core)/threads/set-query-data";
import { likeThread, unlikeThread } from "@/services/thread";
import ThreadEditor from "./ThreadEditor";
import CommentEditor, { type CommentSectionRef } from "./CommentEditor";
import Comments from "./Comments";
import DeleteThreadModal from "./DeleteThreadModal";
import LikeButton from "@/app/(main)/(core)/threads/LikeButton";
import CommentButton from "@/app/(main)/(core)/threads/CommentButton";
import ShareButton from "@/app/(main)/(core)/threads/ShareButton";
import SignInWarningModal from "@/components/SignInWarningModal";
import classes from "./thread.module.css";

export interface ContentProps {
  id: string;
}

export default function Content({ id }: ContentProps) {
  const router = useRouter();

  const { data: session } = authClient.useSession();
  const [isEditable, setIsEditable] = useState(false);
  const [signInWarningModalOpened, signInWarningModalHandlers] =
    useDisclosure(false);
  const [deleteModalOpened, deleteModalHandlers] = useDisclosure(false);

  const commentSectionRef = useRef<CommentSectionRef>(null);

  const { data: thread } = useSuspenseQuery(threadOptions(id));

  const isAuthor = session?.user.id === thread.authorId;
  const hasPermission = session?.user.role === "admin";

  // Like
  const handleLikeMutation = useMutation({
    mutationFn: () => {
      if (thread.likes.liked) {
        return unlikeThread(id);
      } else {
        return likeThread(id);
      }
    },

    onSuccess: () => {
      setLikeThreadQueryData({
        threadId: thread.id,
        like: !thread.likes.liked,
      });
    },
  });

  const handleLike = () => {
    if (!session) {
      signInWarningModalHandlers.open();
      return;
    }

    handleLikeMutation.mutate();
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.header__info}>
          <Avatar
            component={Link}
            href={`/user/${thread.author.username}`}
            src={thread.author.image}
          />

          <div>
            <Anchor
              component={Link}
              href={`/user/${thread.author.username}`}
              className={classes["header__author-name"]}
            >
              {thread.author.name || thread.author.username}
            </Anchor>

            <Text size="xs" className={classes["header__created-at"]}>
              {formatDistanceToNow(new Date(thread.createdAt), {
                addSuffix: true,
              })}

              {thread.updatedAt !== thread.createdAt && <span> (edited)</span>}
            </Text>
          </div>
        </div>

        {(isAuthor || hasPermission) && (
          <Menu>
            <Menu.Target>
              <ActionIcon
                variant="transparent"
                size="lg"
                className={classes["header__more-action-btn"]}
              >
                <IconDots size="1.25em" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {isAuthor && (
                <Menu.Item
                  leftSection={<IconEdit size="1em" />}
                  onClick={() => setIsEditable(true)}
                >
                  Edit
                </Menu.Item>
              )}

              <Menu.Item
                color="red"
                leftSection={<IconTrash size="1em" />}
                onClick={deleteModalHandlers.open}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </div>

      {isEditable ? (
        <>
          <Title className={classes["edit-title"]}>{thread.title}</Title>

          <ThreadEditor
            id={id}
            body={thread.body}
            onClose={() => setIsEditable(false)}
          />
        </>
      ) : (
        <TypographyStylesProvider>
          <h1>{thread.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: thread.body }} />
        </TypographyStylesProvider>
      )}

      <Group my="md">
        <LikeButton
          liked={thread.likes.liked}
          count={thread.likes.count}
          onLike={handleLike}
          size="compact-sm"
        />

        <CommentButton
          count={thread.comments.count}
          size="compact-sm"
          onClick={() => commentSectionRef.current?.editor?.commands.focus()}
        />

        <ShareButton
          size="compact-sm"
          link={`${process.env.NEXT_PUBLIC_BASE_URL}/threads/${thread.id}`}
        />
      </Group>

      <section>
        {session ? (
          <CommentEditor
            ref={commentSectionRef}
            threadId={thread.id}
            onOpenSignInWarningModal={signInWarningModalHandlers.open}
          />
        ) : (
          <Center mt="lg">
            <Button
              component={Link}
              href="/sign-in"
              variant="default"
              fullWidth
            >
              Sign in to comment
            </Button>
          </Center>
        )}

        <Comments
          threadId={thread.id}
          session={session}
          threadAuthor={thread.authorId}
          onOpenSignInWarningModal={signInWarningModalHandlers.open}
        />
      </section>

      {(isAuthor || hasPermission) && (
        <DeleteThreadModal
          id={thread.id}
          title={thread.title}
          opened={deleteModalOpened}
          onClose={deleteModalHandlers.close}
          onDelete={() => router.push("/threads")}
        />
      )}

      {!session && (
        <SignInWarningModal
          opened={signInWarningModalOpened}
          onClose={signInWarningModalHandlers.close}
        />
      )}
    </div>
  );
}
