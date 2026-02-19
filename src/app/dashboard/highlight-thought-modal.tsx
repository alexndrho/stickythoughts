"use client";

import { Button, Group, Modal, Text } from "@mantine/core";

import Thought from "../(main)/thought";
import type { PublicThought } from "@/types/thought";

export interface HighlightThoughtModalProps {
  thought: PublicThought | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error?: string;
}

export default function HighlightThoughtModal({
  thought,
  opened,
  onClose,
  onConfirm,
  isPending,
  error,
}: HighlightThoughtModalProps) {
  return (
    <Modal
      title="Highlight this thought?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text c="dimmed" size="sm">
        Highlighted thoughts appear on the homepage spotlight and replace the
        current highlight.
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

        <Button loading={isPending} onClick={onConfirm} disabled={!thought}>
          Highlight
        </Button>
      </Group>
    </Modal>
  );
}
