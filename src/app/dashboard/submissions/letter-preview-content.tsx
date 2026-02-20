'use client';

import { Text, Title, Typography } from '@mantine/core';

import type { SubmissionLetter } from '@/types/submission';
import { getFormattedDate } from '@/utils/date';
import { formatUserDisplayName } from '@/utils/user';

export interface LetterPreviewContentProps {
  letter: SubmissionLetter | null;
}

export default function LetterPreviewContent({ letter }: LetterPreviewContentProps) {
  return (
    <>
      <Title mb="xs">{letter?.title || '-'}</Title>

      <Text size="sm" c="dimmed">
        Author:{' '}
        {!letter?.author || letter.isAnonymous ? 'Anonymous' : formatUserDisplayName(letter.author)}
      </Text>
      <Text size="sm" c="dimmed">
        Submitted: {letter?.createdAt ? getFormattedDate(letter.createdAt) : '-'}
      </Text>

      <Typography mt="md">
        <div
          dangerouslySetInnerHTML={{
            __html: letter?.body || '<p>-</p>',
          }}
        />
      </Typography>
    </>
  );
}
