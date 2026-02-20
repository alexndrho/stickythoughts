import { type Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/lib/auth';
import Content from './content';

export const metadata: Metadata = {
  title: 'Deleted Content',
  alternates: {
    canonical: '/dashboard/deleted',
  },
};

export default async function DeletedContentPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const hasPermission = await auth.api.userHasPermission({
    body: {
      userId: session?.user.id,
      permission: {
        thought: ['list-deleted'],
        letter: ['list-deleted'],
        letterReply: ['list-deleted'],
      },
    },
  });

  if (!hasPermission.success) {
    notFound();
  }

  return <Content />;
}
