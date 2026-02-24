import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import Content from './content';
import {
  getLetterServer,
  LetterNotFoundError,
} from '@/app/(main)/(core)/letters/[letterId]/letter.server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ letterId: string }>;
}): Promise<Metadata> {
  const { letterId } = await params;

  try {
    const letter = await getLetterServer(letterId);
    return {
      title: `To: ${letter.recipient}`,
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
