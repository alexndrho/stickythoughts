import { getQueryClient } from '@/lib/get-query-client';
import { adminKeys } from '@/lib/query-keys/admin';
import { thoughtKeys } from '@/lib/query-keys/thought';
import type { PrivateHighlightedThought } from '@/types/thought';

export const setThoughtHighlighting = ({
  thought,
  page,
}: {
  thought: PrivateHighlightedThought | null;
  page: number;
}) => {
  const queryClient = getQueryClient();
  queryClient.setQueryData<PrivateHighlightedThought | null>(
    adminKeys.highlightedThought(),
    thought,
  );

  queryClient.invalidateQueries({
    queryKey: adminKeys.thoughtsPage(page),
  });

  queryClient.invalidateQueries({
    queryKey: adminKeys.highlightedThought(),
    refetchType: 'none',
  });

  queryClient.invalidateQueries({
    queryKey: thoughtKeys.highlighted(),
    refetchType: 'none',
  });
};
