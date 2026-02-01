"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

import type { DeletedThreadFromServer } from "@/types/deleted";

export interface PermanentlyDeleteThreadModalProps {
  thread: DeletedThreadFromServer | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (thread: DeletedThreadFromServer) => void;
  loading?: boolean;
}

export const PermanentlyDeleteThreadModal = ({
  thread,
  opened,
  onClose,
  onConfirm,
  loading,
}: PermanentlyDeleteThreadModalProps) => {
  return (
    <Modal
      title="Permanently delete this thread?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text>{thread?.title}</Text>

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
            if (!thread) return;
            onConfirm(thread);
          }}
        >
          Delete Permanently
        </Button>
      </Group>
    </Modal>
  );
};

export interface RecoverThreadModalProps {
  thread: DeletedThreadFromServer | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (thread: DeletedThreadFromServer) => void;
  loading?: boolean;
}

export const RecoverThreadModal = ({
  thread,
  opened,
  onClose,
  onConfirm,
  loading,
}: RecoverThreadModalProps) => {
  return (
    <Modal
      title="Recover this thread?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text>{thread?.title}</Text>

      <Text mt="sm" c="dimmed" size="sm">
        This will restore the thread and make it visible again.
      </Text>

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          loading={loading}
          onClick={() => {
            if (!thread) return;
            onConfirm(thread);
          }}
        >
          Recover
        </Button>
      </Group>
    </Modal>
  );
};
