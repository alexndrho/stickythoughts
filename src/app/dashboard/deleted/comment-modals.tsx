"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

import type { DeletedThreadCommentFromServer } from "@/types/deleted";
import { stripHtmlTags } from "@/utils/text";

export interface PermanentlyDeleteCommentModalProps {
  comment: DeletedThreadCommentFromServer | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (comment: DeletedThreadCommentFromServer) => void;
  loading?: boolean;
}

export const PermanentlyDeleteCommentModal = ({
  comment,
  opened,
  onClose,
  onConfirm,
  loading,
}: PermanentlyDeleteCommentModalProps) => {
  return (
    <Modal
      title="Permanently delete this comment?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text>{stripHtmlTags(comment?.body || "")}</Text>

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
            if (!comment) return;
            onConfirm(comment);
          }}
        >
          Delete Permanently
        </Button>
      </Group>
    </Modal>
  );
};

export interface RecoverCommentModalProps {
  comment: DeletedThreadCommentFromServer | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (comment: DeletedThreadCommentFromServer) => void;
  loading?: boolean;
}

export const RecoverCommentModal = ({
  comment,
  opened,
  onClose,
  onConfirm,
  loading,
}: RecoverCommentModalProps) => {
  return (
    <Modal
      title="Recover this comment?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text>{stripHtmlTags(comment?.body || "")}</Text>

      <Text mt="sm" c="dimmed" size="sm">
        This will restore the comment and make it visible again.
      </Text>

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          loading={loading}
          onClick={() => {
            if (!comment) return;
            onConfirm(comment);
          }}
        >
          Recover
        </Button>
      </Group>
    </Modal>
  );
};
