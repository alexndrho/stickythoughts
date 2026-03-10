'use client';

import { Button, Group, Modal } from '@mantine/core';

import Thought from '@/components/thought';
import type { SubmissionThought } from '@/types/thought-submission';

export interface RejectedThoughtPreviewModalProps {
  thought: SubmissionThought | null;
  opened: boolean;
  onClose: () => void;
  onReopen: (thought: SubmissionThought) => void;
  loading?: boolean;
  canSetStatus: boolean;
}

export default function RejectedThoughtPreviewModal({
  thought,
  opened,
  onClose,
  onReopen,
  loading,
  canSetStatus,
}: RejectedThoughtPreviewModalProps) {
  return (
    <Modal title="Thought Preview" opened={opened} onClose={onClose} centered size="xl">
      {thought && (
        <Thought
          message={thought.message}
          author={thought.author}
          color={thought.color}
          createdAt={thought.createdAt}
          fluid
        />
      )}

      <Group mt="md" justify="right">
        <Button
          loading={loading}
          disabled={!thought || !canSetStatus || thought.status !== 'REJECTED'}
          onClick={() => {
            if (!thought || !canSetStatus) return;
            onReopen(thought);
          }}
        >
          Reopen Submission
        </Button>
      </Group>
    </Modal>
  );
}
