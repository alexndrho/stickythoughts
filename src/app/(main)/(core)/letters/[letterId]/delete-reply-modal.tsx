"use client";

import { useMutation } from "@tanstack/react-query";
import { Button, Group, Modal, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";

import { deleteLetterReply } from "@/services/letter";
import { setDeleteLetterReplyQueryData } from "../set-query-data";
import { stripHtmlTags } from "@/utils/text";
import { type LetterReply } from "@/types/letter";

export interface DeleteReplyModalProps {
  letterId: string;
  reply: LetterReply | null;
  opened: boolean;
  onClose: () => void;
}

export default function DeleteReplyModal({
  letterId,
  reply,
  opened,
  onClose,
}: DeleteReplyModalProps) {
  const deleteMutation = useMutation({
    mutationFn: async ({
      letterId,
      replyId,
      authorUsername,
    }: {
      letterId: string;
      replyId: string;
      authorUsername?: string;
    }) => {
      await deleteLetterReply({
        letterId,
        replyId,
      });

      return { letterId, replyId, authorUsername };
    },
    onSuccess: (data) => {
      setDeleteLetterReplyQueryData({
        ...data,
      });

      notifications.show({
        title: "Reply deleted",
        message: "The reply has been successfully deleted.",
        icon: <IconTrash size="1em" />,
      });

      onClose();
    },
  });

  return (
    <Modal
      title="Are you sure you want to delete this reply?"
      opened={opened}
      onClose={onClose}
      centered
    >
      {reply && (
        <Text mb="md" lineClamp={3}>
          &quot;{stripHtmlTags(reply.body)}&quot;
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
            if (!reply) return;

            deleteMutation.mutate({
              letterId,
              replyId: reply.id,
              authorUsername: reply.author?.username,
            });
          }}
        >
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
