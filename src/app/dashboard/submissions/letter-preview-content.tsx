'use client';

import { Text } from '@mantine/core';
import MultilineText from '@/components/multiline-text';

import type { SubmissionLetter } from '@/types/submission';
import { getFormattedDate } from '@/utils/date';
import { formatUserDisplayName } from '@/utils/user';

export interface LetterPreviewContentProps {
  letter: SubmissionLetter | null;
}

export default function LetterPreviewContent({ letter }: LetterPreviewContentProps) {
  return (
    <>
      <Text size="sm" c="dimmed">
        Author:{' '}
        {!letter?.author || letter.isAnonymous ? 'Anonymous' : formatUserDisplayName(letter.author)}
      </Text>
      <Text size="sm" c="dimmed">
        Recipient: {letter?.recipient || '-'}
      </Text>
      <Text size="sm" c="dimmed">
        Submitted: {letter?.createdAt ? getFormattedDate(letter.createdAt) : '-'}
      </Text>

      <MultilineText text={letter?.body || '-'} mt="md" />
    </>
  );
}
