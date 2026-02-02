"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import {
  ActionIcon,
  Anchor,
  Button,
  Center,
  Group,
  Menu,
  Text,
  Title,
  Typography,
} from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { threadOptions } from "../options";
import { setLikeThreadQueryData } from "@/app/(main)/(core)/threads/set-query-data";
import { likeThread, unlikeThread } from "@/services/thread";
import ThreadEditor from "./thread-editor";
import CommentEditor, { type CommentSectionRef } from "./comment-editor";
import Comments from "./comments";
import DeleteThreadModal from "./delete-thread-modal";
import AuthorAvatar from "@/components/author-avatar";
import LikeButton from "@/app/(main)/(core)/threads/like-button";
import CommentButton from "@/app/(main)/(core)/threads/comment-button";
import ShareButton from "@/app/(main)/(core)/threads/share-button";
import SignInWarningModal from "@/components/sign-in-warning-modal";
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

  const isAuthor = thread.isOwner;
  const hasPermissionToDelete =
    session?.user?.role === "admin" || session?.user?.role === "moderator"
      ? authClient.admin.checkRolePermission({
          role: session.user.role,
          permission: {
            thread: ["delete"],
          },
        })
      : false;

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
        authorUsername: thread.author?.username,
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
          {thread.isAnonymous || !thread.author ? (
            <AuthorAvatar isAnonymous={!!thread.isAnonymous} />
          ) : (
            <AuthorAvatar
              component={Link}
              href={`/user/${thread.author.username}`}
              src={thread.author.image}
            />
          )}

          <div>
            {thread.isAnonymous || !thread.author ? (
              <Text className={classes["header__author-name"]}>Anonymous</Text>
            ) : (
              <Anchor
                component={Link}
                href={`/user/${thread.author.username}`}
                className={classes["header__author-name"]}
              >
                {thread.author.name || thread.author.username}
              </Anchor>
            )}

            <Text size="xs" className={classes["header__created-at"]}>
              {formatDistanceToNow(new Date(thread.createdAt), {
                addSuffix: true,
              })}

              {thread.updatedAt !== thread.createdAt && <span> (edited)</span>}
            </Text>
          </div>
        </div>

        {(isAuthor || hasPermissionToDelete) && (
          <Menu>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                aria-label="Thread more actions"
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
        <Typography>
          <h1>{thread.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: thread.body }} />
        </Typography>
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
            isDefaultAnonymous={isAuthor && !!thread.isAnonymous}
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
          onOpenSignInWarningModal={signInWarningModalHandlers.open}
        />
      </section>

      {(isAuthor || hasPermissionToDelete) && (
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
