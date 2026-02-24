import { Text } from '@mantine/core';
import MultilineText from '@/components/multiline-text';
import type { UserWithAvatarSummary } from '@/types/user';
import { getFormattedDate } from '@/utils/date';
import { formatUserDisplayName } from '@/utils/user';

export interface LetterPreviewData {
  author?: UserWithAvatarSummary | null;
  anonymousFrom?: string | null;
  recipient?: string | null;
  createdAt?: Date | string | null;
  deletedAt?: Date | string | null;
  body?: string | null;
}

export interface LetterPreviewContentProps {
  letter: LetterPreviewData | null;
}

export default function LetterPreviewContent({ letter }: LetterPreviewContentProps) {
  const anonymousFrom = letter?.anonymousFrom;
  const senderName = anonymousFrom || 'Anonymous';
  const previewBody = letter?.body?.trim() || '-';

  return (
    <>
      <Text size="sm" c="dimmed">
        Author:{' '}
        {!letter?.author || anonymousFrom ? senderName : formatUserDisplayName(letter.author)}
      </Text>
      <Text size="sm" c="dimmed">
        Recipient: {letter?.recipient || '-'}
      </Text>
      <Text size="sm" c="dimmed">
        Submitted: {letter?.createdAt ? getFormattedDate(letter.createdAt) : '-'}
      </Text>
      {letter?.deletedAt ? (
        <Text size="sm" c="dimmed">
          Deleted: {getFormattedDate(letter.deletedAt)}
        </Text>
      ) : null}

      <MultilineText text={previewBody} mt="md" />
    </>
  );
}
