import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import Content from './content';
import {
  getLetterServer,
  LetterNotFoundError,
} from '@/app/(main)/(core)/letters/[letterId]/letter.server';
import { sanitizeString } from '@/utils/text';

function toMetadataSnippet(value: string, maxLength: number) {
  const cleaned = sanitizeString(value);
  if (!cleaned) return '';
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trimEnd()}...`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ letterId: string }>;
}): Promise<Metadata> {
  const { letterId } = await params;

  try {
    const letter = await getLetterServer(letterId);
    const recipientSnippet = toMetadataSnippet(letter.recipient, 40);
    const bodySnippet = toMetadataSnippet(letter.body, 96);
    const fallbackDescription = 'Read this public letter shared on StickyThoughts.';
    return {
      title: `To: ${letter.recipient}`,
      description: recipientSnippet
        ? bodySnippet
          ? `Public letter on StickyThoughts to ${recipientSnippet}: ${bodySnippet}`
          : fallbackDescription
        : bodySnippet
          ? `Public letter on StickyThoughts: ${bodySnippet}`
          : fallbackDescription,
      alternates: {
        canonical: `/letters/${letterId}`,
      },
    };
  } catch (err) {
    if (err instanceof LetterNotFoundError) {
      notFound();
    }
    throw err;
  }
}

export default async function PostPage({ params }: { params: Promise<{ letterId: string }> }) {
  const { letterId } = await params;
  let letter: Awaited<ReturnType<typeof getLetterServer>>;

  try {
    letter = await getLetterServer(letterId);
  } catch (err) {
    if (err instanceof LetterNotFoundError) {
      notFound();
    }
    throw err;
  }

  return <Content id={letterId} initialData={letter} />;
}
