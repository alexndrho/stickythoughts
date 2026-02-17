"use client";

import { Button, Group, Modal } from "@mantine/core";
import type { LetterStatus } from "@/generated/prisma/client";

import type { SubmissionLetterFromServer } from "@/types/submission";
import LetterPreviewContent from "./letter-preview-content";

export interface SubmittedLetterPreviewModalProps {
  letter: SubmissionLetterFromServer | null;
  opened: boolean;
  onClose: () => void;
  onSetStatus: (
    letter: SubmissionLetterFromServer,
    status: Extract<LetterStatus, "APPROVED" | "REJECTED">,
  ) => void;
  actionStatus?: Extract<LetterStatus, "APPROVED" | "REJECTED"> | null;
  loading?: boolean;
  canSetStatus: boolean;
}

export default function SubmittedLetterPreviewModal({
  letter,
  opened,
  onClose,
  onSetStatus,
  actionStatus,
  loading,
  canSetStatus,
}: SubmittedLetterPreviewModalProps) {
  const isApproveLoading = loading && actionStatus === "APPROVED";
  const isRejectLoading = loading && actionStatus === "REJECTED";

  return (
    <Modal
      title="Letter Preview"
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
    >
      <LetterPreviewContent letter={letter} />

      <Group mt="md" justify="right">
        <Button
          color="red"
          loading={isRejectLoading}
          disabled={!letter || !canSetStatus}
          onClick={() => {
            if (!letter || !canSetStatus) return;
            onSetStatus(letter, "REJECTED");
          }}
        >
          Reject
        </Button>
        <Button
          loading={isApproveLoading}
          disabled={!letter || !canSetStatus}
          onClick={() => {
            if (!letter || !canSetStatus) return;
            onSetStatus(letter, "APPROVED");
          }}
        >
          Approve
        </Button>
      </Group>
    </Modal>
  );
}
