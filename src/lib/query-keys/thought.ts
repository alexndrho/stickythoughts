import type { ThoughtsSort } from '@/types/thought';

export const thoughtKeys = {
  all: () => ['thoughts'] as const,
  count: () => [...thoughtKeys.all(), 'count'] as const,
  infinite: (args?: { sort: ThoughtsSort; seed?: string }) =>
    [
      ...thoughtKeys.all(),
      'infiniteThoughts',
      ...(args ? [args.sort, ...(args.seed ? [args.seed] : [])] : []),
    ] as const,
  infiniteSearch: ({ search, sort, seed }: { search: string; sort: ThoughtsSort; seed?: string }) =>
    [...thoughtKeys.infinite({ sort, seed }), 'infiniteSearch', search] as const,
  highlighted: () => [...thoughtKeys.all(), 'highlighted'] as const,
};
