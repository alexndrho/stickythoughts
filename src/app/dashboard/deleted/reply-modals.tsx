"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

import type { DeletedLetterReplyFromServer } from "@/types/deleted";
import { stripHtmlTags } from "@/utils/text";

export interface PermanentlyDeleteReplyModalProps {
  reply: DeletedLetterReplyFromServer | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (reply: DeletedLetterReplyFromServer) => void;
  loading?: boolean;
}

export const PermanentlyDeleteReplyModal = ({
  reply,
  opened,
  onClose,
  onConfirm,
  loading,
}: PermanentlyDeleteReplyModalProps) => {
  return (
    <Modal
      title="Permanently delete this reply?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text>{stripHtmlTags(reply?.body || "")}</Text>

      <Text mt="sm" c="dimmed" size="sm">
        This action cannot be undone.
      </Text>

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="red"
          loading={loading}
          onClick={() => {
            if (!reply) return;
            onConfirm(reply);
          }}
        >
          Delete Permanently
        </Button>
      </Group>
    </Modal>
  );
};

export interface RecoverReplyModalProps {
  reply: DeletedLetterReplyFromServer | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (reply: DeletedLetterReplyFromServer) => void;
  loading?: boolean;
}

export const RecoverReplyModal = ({
  reply,
  opened,
  onClose,
  onConfirm,
  loading,
}: RecoverReplyModalProps) => {
  return (
    <Modal
      title="Recover this reply?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text>{stripHtmlTags(reply?.body || "")}</Text>

      <Text mt="sm" c="dimmed" size="sm">
        This will restore the reply and make it visible again.
      </Text>

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          loading={loading}
          onClick={() => {
            if (!reply) return;
            onConfirm(reply);
          }}
        >
          Recover
        </Button>
      </Group>
    </Modal>
  );
};
