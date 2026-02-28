'use client';

import { startTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Group, Text, Title } from '@mantine/core';

import RateLimitExceededContent from '@/components/status/rate-limit-exceeded-content';
import classes from '@/styles/status/status-content.module.css';

function isRateLimitError(error: unknown): boolean {
  // In App Router, server-thrown errors can lose prototype during serialization.
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'RateLimitExceededError'
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const retry = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  useEffect(() => {
    // Keep a breadcrumb in the console for debugging.
    console.error(error);
  }, [error]);

  if (isRateLimitError(error)) {
    return <RateLimitExceededContent error={error} onRetry={reset} />;
  }

  return (
    <div className={classes['status-content']}>
      <Title c="blue" className={classes['status-content__title']}>
        <span className={classes['status-content__status-code']}>500</span>
        Something went wrong
      </Title>

      <Text size="xl" className={classes['status-content__description']}>
        We hit an unexpected error while loading this page.
      </Text>

      <Group>
        <Button variant="default" onClick={retry}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="default">Return to home</Button>
        </Link>
      </Group>
    </div>
  );
}
