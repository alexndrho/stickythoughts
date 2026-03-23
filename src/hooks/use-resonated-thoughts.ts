'use client';

import { type InfiniteData, useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { getQueryClient } from '@/lib/get-query-client';
import { thoughtKeys } from '@/lib/query-keys/thought';
import { resonateThought } from '@/services/thought';
import { THOUGHT_COLOR_SHADE } from '@/config/thought';
import type { PublicThought } from '@/types/thought';
import ServerError from '@/utils/error/ServerError';

export function useResonatedThoughts() {
  const [resonatedIds, setResonatedIds] = useLocalStorage<string[]>({
    key: 'resonated-thoughts',
    defaultValue: [],
    getInitialValueInEffect: true,
  });

  const ids = Array.isArray(resonatedIds) ? resonatedIds : [];

  const hasResonated = (thoughtId: string) => ids.includes(thoughtId);

  const addResonatedId = (thoughtId: string) => {
    setResonatedIds((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (list.includes(thoughtId)) return list;

      return [...list, thoughtId];
    });
  };

  const mutation = useMutation({
    mutationFn: ({ id }: { id: string; color?: string | null }) => resonateThought(id),
    onSuccess: ({ resonanceCount }, { id }) => {
      addResonatedId(id);

      const queryClient = getQueryClient();

      queryClient.setQueriesData<InfiniteData<PublicThought[]>>(
        { queryKey: thoughtKeys.infinite() },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((thought) => (thought.id === id ? { ...thought, resonanceCount } : thought)),
            ),
          };
        },
      );

      queryClient.setQueryData<PublicThought | null>(thoughtKeys.highlighted(), (oldData) => {
        if (!oldData || oldData.id !== id) return oldData;
        return { ...oldData, resonanceCount };
      });
    },
    onError: (error, { id, color }) => {
      if (
        error instanceof ServerError &&
        error.issues.some((issue) => issue.code === 'ratelimit/resonance-exceeded')
      ) {
        addResonatedId(id);

        notifications.show({
          color: color ? `${color}.${THOUGHT_COLOR_SHADE}` : undefined,
          title: 'Already resonated',
          message: 'You have already resonated with this thought today.',
        });
      }
    },
  });

  return { hasResonated, mutation };
}
