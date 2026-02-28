import Link from 'next/link';
import { Button, Group, Text, Title } from '@mantine/core';

import classes from '@/styles/status/status-content.module.css';

export default function RateLimitExceededContent(props: { error?: unknown; onRetry?: () => void }) {
  return (
    <div className={classes['status-content']}>
      <Title c="blue" className={classes['status-content__title']}>
        <span className={classes['status-content__status-code']}>429</span>
        Too Many Requests
      </Title>

      <Text size="xl" className={classes['status-content__description']}>
        You&apos;ve hit a rate limit. Please wait a moment and try again.
      </Text>

      <Group>
        <Button variant="default" onClick={props.onRetry}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="default">Return to home</Button>
        </Link>
      </Group>
    </div>
  );
}
