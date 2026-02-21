'use client';

import Link from 'next/link';
import { Button, Card, Text } from '@mantine/core';

import { authClient } from '@/lib/auth-client';
import classes from './letters.module.css';

export default function SignInCard() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <>
      {!session && !isPending && (
        <Card withBorder className={classes['sign-in-card']}>
          <Text size="xs" c="blue" className={classes['sign-in-prompt__eyebrow']}>
            New here?
          </Text>

          <Text size="lg" className={classes['sign-in-prompt__title']}>
            Write a letter for someone
          </Text>

          <Text className={classes['sign-in-prompt__copy']}>
            You can write a letter with your name or anonymously, even without an account. Guest
            letters are reviewed before publishing. Sign in to reply and interact, and verify your
            account to publish instantly.
          </Text>

          <div className={classes['sign-in-prompt__actions']}>
            <Button component={Link} href="/sign-in" variant="default">
              Sign in
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
