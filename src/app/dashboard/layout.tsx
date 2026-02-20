import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import AdminShell from './admin-shell';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== 'admin' && session?.user.role !== 'moderator') {
    notFound();
  }

  return <AdminShell role={session.user.role}>{children}</AdminShell>;
}
