'use client';

import { Modal } from '@mantine/core';

import LetterPreviewContent, { type LetterPreviewData } from './letter-preview-content';

export interface LetterPreviewProps {
  title: string;
  letter: LetterPreviewData | null;
  opened: boolean;
  onClose: () => void;
}

export default function LetterPreview({ title, letter, opened, onClose }: LetterPreviewProps) {
  return (
    <Modal title={title} opened={opened} onClose={onClose} centered size="xl">
      <LetterPreviewContent letter={letter} />
    </Modal>
  );
}
