import { Container } from '@mantine/core';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import classes from './auth.module.css';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect('/');
  }

  return <Container className={classes.container}>{children}</Container>;
}
