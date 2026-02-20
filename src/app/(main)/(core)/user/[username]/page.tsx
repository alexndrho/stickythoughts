import { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import { userKeys } from '@/lib/query-keys';
import { getQueryClient } from '@/lib/get-query-client';
import { getUserServer, UserNotFoundError } from '@/app/(main)/(core)/user/[username]/user.server';
import { formatUserDisplayName } from '@/utils/user';
import Content from './content';

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

  const queryClient = getQueryClient();

  try {
    const user = await getUserServer(username);
    queryClient.setQueryData(userKeys.byUsername(username), user);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      notFound();
    }
    throw err;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Content username={username} />
    </HydrationBoundary>
  );
}
