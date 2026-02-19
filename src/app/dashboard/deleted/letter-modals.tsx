"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

import type { DeletedLetter } from "@/types/deleted";

export interface PermanentlyDeleteLetterModalProps {
  letter: DeletedLetter | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (letter: DeletedLetter) => void;
  loading?: boolean;
}

export const PermanentlyDeleteLetterModal = ({
  letter,
  opened,
  onClose,
  onConfirm,
  loading,
}: PermanentlyDeleteLetterModalProps) => {
  return (
    <Modal
      title="Permanently delete this letter?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text>{letter?.title}</Text>

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
            if (!letter) return;
            onConfirm(letter);
          }}
        >
          Delete Permanently
        </Button>
      </Group>
    </Modal>
  );
};

export interface RecoverLetterModalProps {
  letter: DeletedLetter | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (letter: DeletedLetter) => void;
  loading?: boolean;
}

export const RecoverLetterModal = ({
  letter,
  opened,
  onClose,
  onConfirm,
  loading,
}: RecoverLetterModalProps) => {
  return (
    <Modal
      title="Recover this letter?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text>{letter?.title}</Text>

      <Text mt="sm" c="dimmed" size="sm">
        This will restore the letter and make it visible again.
      </Text>

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          loading={loading}
          onClick={() => {
            if (!letter) return;
            onConfirm(letter);
          }}
        >
          Recover
        </Button>
      </Group>
    </Modal>
  );
};
