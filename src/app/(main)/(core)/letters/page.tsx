import { Suspense } from 'react';
import { type Metadata } from 'next';
import { Paper, Text, Title } from '@mantine/core';

import LettersActions from './letters-actions';
import HeaderNote from './header-note';
import SignInCard from './sign-in-card';
import LettersListServer from './letters-list.server';
import { LettersSkeleton } from '@/components/letters/letters-skeleton';
import classes from './letters.module.css';

export const metadata: Metadata = {
  title: 'Letters',
  alternates: {
    canonical: `/letters`,
  },
};

export default function LettersPage() {
  return (
    <div className={classes.container}>
      <Paper component="header" withBorder className={classes['header']}>
        <div className={classes['header__content']}>
          <Text size="xs" className={classes['header__eyebrow']}>
            Letters
          </Text>

          <Title className={classes['header__title']}>Longer stories. Sent with heart.</Title>

          <Text className={classes.header__description}>
            Write a letter for someone on your mind. Send it named or anonymous, then read and reply
            to letters that resonate.
          </Text>

          <LettersActions />
        </div>

        <HeaderNote />
      </Paper>

      <SignInCard />

      <Suspense fallback={<LettersSkeleton />}>
        <LettersListServer />
      </Suspense>
    </div>
  );
}
