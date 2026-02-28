import Link from 'next/link';
import { Button, Text, Title } from '@mantine/core';

import classes from '@/styles/status/status-content.module.css';

export default function NotFoundContent() {
  return (
    <div className={classes['status-content']}>
      <Title c="blue" className={classes['status-content__title']}>
        <span className={classes['status-content__status-code']}>404</span>
        Page Not Found
      </Title>

      <Text size="xl" className={classes['status-content__description']}>
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </Text>

      <Link href="/">
        <Button variant="default">Return to home</Button>
      </Link>
    </div>
  );
}
