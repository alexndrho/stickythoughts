import 'server-only';

import { openai } from '@/lib/openai';

// Only flag on high-severity subcategories — light touch.
// Base categories (hate, harassment, violence, self-harm, sexual, illicit) are intentionally
// excluded to avoid over-flagging. Only the explicit/threatening/harmful subcategories are used.

export async function moderateContent(text: string): Promise<{
  flagged: boolean;
}> {
  const result = await openai.moderations.create({
    model: 'omni-moderation-latest',
    input: text,
  });

  const flagged = result.results.some((r) => r.flagged);

  return {
    flagged,
  };
}
