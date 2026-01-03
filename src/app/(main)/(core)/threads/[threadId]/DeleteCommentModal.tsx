"use client";

import { useMutation } from "@tanstack/react-query";
import { Button, Group, Modal, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";

import { deleteThreadComment } from "@/services/thread";
import { setDeleteThreadCommentQueryData } from "../set-query-data";
import { stripHtmlTags } from "@/utils/text";
import { type ThreadCommentType } from "@/types/thread";

export interface DeleteCommentModalProps {
  threadId: string;
  comment: ThreadCommentType | null;
  opened: boolean;
  onClose: () => void;
}

export default function DeleteCommentModal({
  threadId,
  comment,
  opened,
  onClose,
}: DeleteCommentModalProps) {
  const deleteMutation = useMutation({
    mutationFn: async ({
      threadId,
      commentId,
    }: {
      threadId: string;
      commentId: string;
    }) => {
      await deleteThreadComment({
        threadId,
        commentId,
      });

      return { threadId, commentId };
    },
    onSuccess: (data) => {
      setDeleteThreadCommentQueryData({
        threadId: data.threadId,
        commentId: data.commentId,
      });

      notifications.show({
        title: "Comment deleted",
        message: "The comment has been successfully deleted.",
        icon: <IconTrash size="1em" />,
      });
    },
  });

  return (
    <Modal
      title="Are you sure you want to delete this comment?"
      opened={opened}
      onClose={onClose}
      centered
    >
      {comment && (
        <Text mb="md" lineClamp={3}>
          &quot;{stripHtmlTags(comment.body)}&quot;
        </Text>
      )}

      <Group justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>

        <Button
          color="red"
          loading={deleteMutation.isPending}
          onClick={() => {
            if (!comment) return;

            deleteMutation.mutate({
              threadId,
              commentId: comment.id,
            });
          }}
        >
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
