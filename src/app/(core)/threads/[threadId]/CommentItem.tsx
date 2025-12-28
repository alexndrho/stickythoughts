"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { formatDistance } from "date-fns";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  Menu,
  Text,
  TypographyStylesProvider,
} from "@mantine/core";
import { isNotEmptyHTML, useForm } from "@mantine/form";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";

import { type authClient } from "@/lib/auth-client";
import { setUpdateThreadCommentQueryData } from "@/app/(core)/threads/set-query-data";
import TextEditor from "@/components/TextEditor";
import LikeButton from "@/app/(core)/threads/LikeButton";
import { useTiptapEditor } from "@/hooks/use-tiptap";
import { updateThreadComment } from "@/services/thread";
import ServerError from "@/utils/error/ServerError";
import type { ThreadCommentType } from "@/types/thread";
import classes from "./thread.module.css";

export interface CommentItemProps {
  session: ReturnType<typeof authClient.useSession>["data"];
  comment: ThreadCommentType;
  dateNow: Date;
  isThreadOwner?: boolean;
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
  dateNow,
  isThreadOwner,
  onLike,
  onDelete,
}: CommentItemProps) {
  const [isEditable, setIsEditable] = useState(false);

  return (
    <Box>
      <Flex gap="md" align="center">
        <Avatar
          component={Link}
          src={comment.author.image}
          href={`/user/${comment.author.username}`}
          aria-label={`View profile of ${comment.author.username}`}
        />

        <div>
          <Flex>
            <Text fw="bold" truncate>
              <Anchor
                component={Link}
                href={`/user/${comment.author.username}`}
                c="inherit"
                inherit
              >
                {comment.author.name || comment.author.username}
              </Anchor>

              {isThreadOwner && (
                <Text c="blue" fz="xs" fw="bold" span>
                  {" "}
                  OP
                </Text>
              )}
            </Text>
          </Flex>

          <Text fz="xs" c="dimmed">
            {formatDistance(new Date(comment.createdAt), dateNow, {
              addSuffix: true,
            })}

            {comment.updatedAt !== comment.createdAt && (
              <Text span inherit>
                {" "}
                (edited)
              </Text>
            )}
          </Text>
        </div>

        {session?.user.id === comment.author.id && (
          <Box ml="auto">
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
                <Menu.Item
                  leftSection={<IconEdit size="1em" />}
                  onClick={() => setIsEditable(true)}
                >
                  Edit
                </Menu.Item>

                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size="1em" />}
                  onClick={() =>
                    onDelete({
                      threadId: comment.threadId,
                      commentId: comment.id,
                      username: comment.author.username,
                    })
                  }
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
        )}
      </Flex>

      <Box mt="sm" pl={54}>
        {isEditable ? (
          <Editor comment={comment} onClose={() => setIsEditable(false)} />
        ) : (
          <>
            <TypographyStylesProvider>
              <div dangerouslySetInnerHTML={{ __html: comment.body }} />
            </TypographyStylesProvider>

            <LikeButton
              mt="md"
              liked={comment.likes.liked}
              count={comment.likes.count}
              size="compact-sm"
              onLike={() =>
                onLike({
                  threadId: comment.threadId,
                  commentId: comment.id,
                  username: comment.author.username,
                  like: !comment.likes.liked,
                })
              }
            />
          </>
        )}
      </Box>
    </Box>
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
