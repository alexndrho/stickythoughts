"use client";

import { Stack, Text, Title, Typography } from "@mantine/core";

import type { SubmissionLetterFromServer } from "@/types/submission";
import { getFormattedDate } from "@/utils/date";
import { formatUserDisplayName } from "@/utils/user";

export interface LetterPreviewContentProps {
  letter: SubmissionLetterFromServer | null;
}

export default function LetterPreviewContent({
  letter,
}: LetterPreviewContentProps) {
  return (
    <>
      <Stack gap="xs">
        <Title>{letter?.title || "-"}</Title>

        <Text size="sm" c="dimmed">
          Author:{" "}
          {!letter?.author || letter.isAnonymous
            ? "Anonymous"
            : formatUserDisplayName(letter.author)}
        </Text>
        <Text size="sm" c="dimmed">
          Submitted:{" "}
          {letter?.createdAt ? getFormattedDate(letter.createdAt) : "-"}
        </Text>
      </Stack>

      <Typography mt="md">
        <div
          dangerouslySetInnerHTML={{
            __html: letter?.body || "<p>-</p>",
          }}
        />
      </Typography>
    </>
  );
}
