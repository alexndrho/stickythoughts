import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getUserServer, UserNotFoundError } from '@/app/(main)/(core)/user/[username]/user.server';
import { formatUserDisplayName } from '@/utils/user';
import { sanitizeString } from '@/utils/text';
import Content from './content';

function toMetadataSnippet(value: string, maxLength: number) {
  const cleaned = sanitizeString(value);
  if (!cleaned) return '';
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trimEnd()}...`;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;

  try {
    const user = await getUserServer(username);

    const tabParam = resolvedSearchParams.tab || '';
    let canonical = `/user/${username}`;
    if (tabParam === 'replies') {
      canonical = `/user/${username}?tab=replies`;
    } else if (tabParam === 'likes') {
      canonical = `/user/${username}?tab=likes`;
    }

    return {
      title: formatUserDisplayName(user),
      description: user.bio
        ? `${formatUserDisplayName(user)} on StickyThoughts. ${toMetadataSnippet(user.bio, 112)}`
        : `Explore ${formatUserDisplayName(user)} on StickyThoughts, including their public letters, replies, and likes.`,
      alternates: {
        canonical,
      },
    };
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      notFound();
    }
    throw err;
  }
}

export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let user: Awaited<ReturnType<typeof getUserServer>>;

  try {
    user = await getUserServer(username);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      notFound();
    }
    throw err;
  }

  return <Content username={username} initialData={user} />;
}
