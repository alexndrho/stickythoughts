import { Card, Skeleton, Text } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';

import classes from './home.module.css';

export interface ThoughtCountProps {
  count?: number;
  loading?: boolean;
}

export default function ThoughtCount({ count = 0, loading = false }: ThoughtCountProps) {
  return (
    <Skeleton
      visible={loading}
      component={Card}
      className={classes['header__skeleton-wrapper-thought-counter']}
    >
      <IconMessage size="1em" className={classes['header__thought-counter-icon']} />

      <Text className={classes['header__thought-counter']}>
        {count.toLocaleString()}{' '}
        <Text c="blue" span inherit>
          thoughts
        </Text>{' '}
        submitted
      </Text>
    </Skeleton>
  );
}
