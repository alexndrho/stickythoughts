"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Button,
  Group,
  Menu,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { isNotEmptyHTML, useForm } from "@mantine/form";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";

import { type authClient } from "@/lib/auth-client";
import { setUpdateThreadCommentQueryData } from "@/app/(main)/(core)/threads/set-query-data";
import TextEditor from "@/components/TextEditor";
import AuthorAvatar from "@/components/AuthorAvatar";
import LikeButton from "@/app/(main)/(core)/threads/LikeButton";
import { useTiptapEditor } from "@/hooks/use-tiptap";
import { updateThreadComment } from "@/services/thread";
import ServerError from "@/utils/error/ServerError";
import type { ThreadCommentType } from "@/types/thread";
import classes from "./thread.module.css";

export interface CommentItemProps {
  session: ReturnType<typeof authClient.useSession>["data"];
  comment: ThreadCommentType;
  onLike: ({
    threadId,
    commentId,
    username,
    like,
  }: {
    threadId: string;
    commentId: string;
    username: string;
    like: boolean;
  }) => void;
  onDelete: ({
    threadId,
    commentId,
    username,
  }: {
    threadId: string;
    commentId: string;
    username: string;
  }) => void;
}

export default function CommentItem({
  session,
  comment,
  onLike,
  onDelete,
}: CommentItemProps) {
  const [isEditable, setIsEditable] = useState(false);

  const isAuthor = session?.user.id === comment.author?.id;
  const hasPermission = session?.user.role === "admin";

  return (
    <div>
      <div className={classes["comment-item__header"]}>
        {comment.isAnonymous || !comment.author ? (
          <AuthorAvatar isAnonymous={!!comment.isAnonymous} />
        ) : (
          <Avatar
            component={Link}
            src={comment.author.image}
            href={`/user/${comment.author.username}`}
            aria-label={`View profile of ${comment.author.username}`}
          />
        )}

        <div>
          <div className={classes["comment-item__author-container"]}>
            {comment.isAnonymous || !comment.author ? (
              <Text className={classes["comment-item__author-name"]}>
                Anonymous
              </Text>
            ) : (
              <Anchor
                component={Link}
                truncate
                href={`/user/${comment.author.username}`}
                className={classes["comment-item__author-name"]}
              >
                {comment.author.name || comment.author.username}
              </Anchor>
            )}

            {comment.isOP && (
              <Text
                size="xs"
                className={classes["comment-item__author-op-badge"]}
              >
                OP
              </Text>
            )}
          </div>

          <Text size="xs" className={classes["comment-item__created-at"]}>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}

            {comment.updatedAt !== comment.createdAt && <span> (edited)</span>}
          </Text>
        </div>

        {(isAuthor || hasPermission) && (
          <Menu>
            <Menu.Target>
              <ActionIcon
                variant="transparent"
                size="lg"
                className={classes["comment-item__more-action-btn"]}
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
                onClick={() => {
                  if (!comment.author) return;

                  onDelete({
                    threadId: comment.threadId,
                    commentId: comment.id,
                    username: comment.author.username,
                  });
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </div>

      <div className={classes["comment-item__content"]}>
        {isEditable ? (
          <Editor comment={comment} onClose={() => setIsEditable(false)} />
        ) : (
          <>
            <TypographyStylesProvider>
              <div dangerouslySetInnerHTML={{ __html: comment.body }} />
            </TypographyStylesProvider>

            <LikeButton
              liked={comment.likes.liked}
              count={comment.likes.count}
              size="compact-sm"
              className={classes["comment-item__like-btn"]}
              onLike={() => {
                if (!comment.author) return;

                onLike({
                  threadId: comment.threadId,
                  commentId: comment.id,
                  username: comment.author.username,
                  like: !comment.likes.liked,
                });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Editor({
  comment,
  onClose,
}: {
  comment: ThreadCommentType;
  onClose: () => void;
}) {
  const updateForm = useForm({
    initialValues: {
      body: comment.body,
    },
    validate: {
      body: isNotEmptyHTML("Comment is required"),
    },
  });

  const editor = useTiptapEditor({
    content: comment.body,
    placeholder: "Write a comment...",
    onUpdate: ({ editor }) => {
      updateForm.setFieldValue("body", editor.getHTML());
    },
    shouldRerenderOnTransaction: false,
  });

  useEffect(() => {
    if (editor) {
      editor.commands.focus("end");
    }
  }, [editor]);

  const updateMutation = useMutation({
    mutationFn: (values: typeof updateForm.values) =>
      updateThreadComment({
        threadId: comment.threadId,
        commentId: comment.id,
        body: values.body,
      }),
    onSuccess: (data) => {
      onClose();

      updateForm.setInitialValues({
        body: data.body,
      });
      updateForm.reset();

      setUpdateThreadCommentQueryData({
        threadId: comment.threadId,
        commentId: comment.id,
        comment: data,
      });
    },
    onError: (error) => {
      if (error instanceof ServerError) {
        updateForm.setFieldError("body", error.issues[0].message);
      } else {
        updateForm.setFieldError("body", "Something went wrong");
      }
    },
  });

  return (
    <form
      onSubmit={updateForm.onSubmit((values) => updateMutation.mutate(values))}
    >
      <TextEditor editor={editor} error={updateForm.errors.comment} />

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={!updateForm.isDirty()}
          loading={updateMutation.isPending}
        >
          Save
        </Button>
      </Group>
    </form>
  );
}
