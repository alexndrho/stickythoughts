'use client';

import { Button, Group, Modal } from '@mantine/core';

import type { SubmissionLetter } from '@/types/submission';
import LetterPreviewContent from './letter-preview-content';

export interface RejectedLetterPreviewModalProps {
  letter: SubmissionLetter | null;
  opened: boolean;
  onClose: () => void;
  onReopen: (letter: SubmissionLetter) => void;
  loading?: boolean;
  canSetStatus: boolean;
}

export default function RejectedLetterPreviewModal({
  letter,
  opened,
  onClose,
  onReopen,
  loading,
  canSetStatus,
}: RejectedLetterPreviewModalProps) {
  return (
    <Modal title="Letter Preview" opened={opened} onClose={onClose} centered size="xl">
      <LetterPreviewContent letter={letter} />

      <Group mt="md" justify="right">
        <Button
          loading={loading}
          disabled={!letter || !canSetStatus || letter.status !== 'REJECTED'}
          onClick={() => {
            if (!letter || !canSetStatus) return;
            onReopen(letter);
          }}
        >
          Reopen Submission
        </Button>
      </Group>
    </Modal>
  );
}
