"use client";

import { Button, Group, Modal, Paper, Text } from "@mantine/core";

import type { DeletedThought } from "@/types/deleted";

export interface PermanentlyDeleteThoughtModalProps {
  thought: DeletedThought | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (thought: DeletedThought) => void;
  loading?: boolean;
}

export const PermanentlyDeleteThoughtModal = ({
  thought,
  opened,
  onClose,
  onConfirm,
  loading,
}: PermanentlyDeleteThoughtModalProps) => {
  return (
    <Modal
      title="Permanently delete this thought?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Paper p="xs" c="black" bg={`${thought?.color}.6`} withBorder>
        <Text>{thought?.message}</Text>

        <Text ta="end">
          {"\u2013"} {thought?.author}
        </Text>
      </Paper>

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
            if (!thought) return;
            onConfirm(thought);
          }}
        >
          Delete Permanently
        </Button>
      </Group>
    </Modal>
  );
};

export interface RecoverThoughtModalProps {
  thought: DeletedThought | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (thought: DeletedThought) => void;
  loading?: boolean;
}

export const RecoverThoughtModal = ({
  thought,
  opened,
  onClose,
  onConfirm,
  loading,
}: RecoverThoughtModalProps) => {
  return (
    <Modal
      title="Recover this thought?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Paper p="xs" c="black" bg={`${thought?.color}.6`} withBorder>
        <Text>{thought?.message}</Text>

        <Text ta="end">
          {"\u2013"} {thought?.author}
        </Text>
      </Paper>

      <Text mt="sm" c="dimmed" size="sm">
        This will restore the thought and make it visible again.
      </Text>

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          loading={loading}
          onClick={() => {
            if (!thought) return;
            onConfirm(thought);
          }}
        >
          Recover
        </Button>
      </Group>
    </Modal>
  );
};
