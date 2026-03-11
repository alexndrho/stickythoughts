import 'server-only';

import { openai } from '@/lib/openai';

type ModerationInput =
  | { type: 'text'; text: string }
  | { type: 'image'; buffer: Buffer; mimeType?: string };

export async function moderateContent(input: ModerationInput): Promise<{ flagged: boolean }> {
  const payload =
    input.type === 'text'
      ? input.text
      : [
          {
            type: 'image_url' as const,
            image_url: {
              url: `data:${input.mimeType ?? 'image/png'};base64,${input.buffer.toString('base64')}`,
            },
          },
        ];

  const result = await openai.moderations.create({
    model: 'omni-moderation-latest',
    input: payload,
  });

  return { flagged: result.results.some((r) => r.flagged) };
}
