'use client';

import { useQuery } from '@tanstack/react-query';

import { thoughtCountOptions } from './options';
import ThoughtCount from './thought-count';

export default function ThoughtCountClient({ initialCount }: { initialCount?: number }) {
  const { data: thoughtsCountData } = useQuery({
    ...thoughtCountOptions,
    initialData: initialCount,
  });

  return <ThoughtCount count={thoughtsCountData} />;
}
