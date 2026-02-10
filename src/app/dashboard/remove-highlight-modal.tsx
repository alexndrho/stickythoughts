"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

import Thought from "../(main)/thought";
import type { PublicThoughtPayload } from "@/types/thought";

export interface RemoveHighlightModalProps {
  thought: PublicThoughtPayload | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error?: string;
}

export default function RemoveHighlightModal({
  thought,
  opened,
  onClose,
  onConfirm,
  isPending,
  error,
}: RemoveHighlightModalProps) {
  return (
    <Modal title="Remove highlight?" opened={opened} onClose={onClose} centered>
      <Text c="dimmed" size="sm">
        This will remove the thought from the homepage spotlight.
      </Text>

      <Thought
        mt="sm"
        message={thought?.message ?? "No thought selected yet."}
        author={thought?.author ?? "Unknown"}
        color={thought?.color}
        fluid
      />

      {error ? (
        <Text c="var(--mantine-color-error)" size="sm" mt="sm">
          {error}
        </Text>
      ) : null}

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>

        <Button
          loading={isPending}
          onClick={onConfirm}
          color="red"
          disabled={!thought}
        >
          Remove highlight
        </Button>
      </Group>
    </Modal>
  );
}
