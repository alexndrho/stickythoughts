import { Suspense } from 'react';
import { type Metadata } from 'next';
import { Alert, Paper, Text, Title } from '@mantine/core';
import { IconBubbleTextFilled } from '@tabler/icons-react';

import ThoughtCount from './thought-count';
import HeaderCarousel from './header-carousel';
import ThoughtCountServer from './thought-count.server';
import HeaderCarouselServer from './header-carousel.server';
import ThoughtsServer from './thoughts.server';
import ThoughtsLoader from './thoughts-loader';
import { getQuestionOfTheDay } from './query';
import classes from './home.module.css';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const qotd = await getQuestionOfTheDay();

  return (
    <div className={classes.container}>
      <Paper component="header" withBorder className={classes.header}>
        <div>
          <Text size="xs" className={classes['header__eyebrow']}>
            STICKYTHOUGHTS
          </Text>

          <Title className={classes['header__title']}>
            A place where you can freely express yourself
          </Title>

          <Text className={classes['header__description']}>
            Share a thought, start a letter, or find the voices you care about. Everything begins
            with a line.
          </Text>

          <Suspense fallback={<ThoughtCount loading={true} />}>
            <ThoughtCountServer />
          </Suspense>
        </div>

        <Suspense fallback={<HeaderCarousel loading={true} />}>
          <HeaderCarouselServer />
        </Suspense>
      </Paper>

      <Alert icon={<IconBubbleTextFilled />} title="Question of the day" className={classes.qotd}>
        {qotd}
      </Alert>

      <Suspense fallback={<ThoughtsLoader />}>
        <ThoughtsServer />
      </Suspense>
    </div>
  );
}
