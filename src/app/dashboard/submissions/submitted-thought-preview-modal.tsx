'use client';

import { Button, Group, Modal } from '@mantine/core';
import type { ModerationStatus } from '@/generated/prisma/client';

import Thought from '@/components/thought';
import type { SubmissionThought } from '@/types/thought-submission';

export interface SubmittedThoughtPreviewModalProps {
  thought: SubmissionThought | null;
  opened: boolean;
  onClose: () => void;
  onSetStatus: (
    thought: SubmissionThought,
    status: Extract<ModerationStatus, 'APPROVED' | 'REJECTED'>,
  ) => void;
  actionStatus?: Extract<ModerationStatus, 'APPROVED' | 'REJECTED'> | null;
  loading?: boolean;
  canSetStatus: boolean;
}

export default function SubmittedThoughtPreviewModal({
  thought,
  opened,
  onClose,
  onSetStatus,
  actionStatus,
  loading,
  canSetStatus,
}: SubmittedThoughtPreviewModalProps) {
  const isApproveLoading = loading && actionStatus === 'APPROVED';
  const isRejectLoading = loading && actionStatus === 'REJECTED';

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
          color="red"
          loading={isRejectLoading}
          disabled={!thought || !canSetStatus}
          onClick={() => {
            if (!thought || !canSetStatus) return;
            onSetStatus(thought, 'REJECTED');
          }}
        >
          Reject
        </Button>
        <Button
          loading={isApproveLoading}
          disabled={!thought || !canSetStatus}
          onClick={() => {
            if (!thought || !canSetStatus) return;
            onSetStatus(thought, 'APPROVED');
          }}
        >
          Approve
        </Button>
      </Group>
    </Modal>
  );
}
