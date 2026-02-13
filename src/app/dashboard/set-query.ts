import { getQueryClient } from "@/lib/get-query-client";
import { adminKeys, thoughtKeys } from "@/lib/query-keys";
import type { PrivateHighlightedThoughtPayload } from "@/types/thought";

export const setThoughtHighlighting = ({
  thought,
  page,
}: {
  thought: PrivateHighlightedThoughtPayload | null;
  page: number;
}) => {
  const queryClient = getQueryClient();
  queryClient.setQueryData<PrivateHighlightedThoughtPayload | null>(
    adminKeys.highlightedThought(),
    thought,
  );

  queryClient.invalidateQueries({
    queryKey: adminKeys.thoughtsPage(page),
  });

  queryClient.invalidateQueries({
    queryKey: adminKeys.highlightedThought(),
    refetchType: "none",
  });

  queryClient.invalidateQueries({
    queryKey: thoughtKeys.highlighted(),
    refetchType: "none",
  });
};
