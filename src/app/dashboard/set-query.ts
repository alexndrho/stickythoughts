import { getQueryClient } from "@/lib/get-query-client";
import { adminThoughtsOptions, adminThoughtsPageOptions } from "./options";
import type { PrivateThoughtPayload } from "@/types/thought";

export const setThoughtHighlighting = ({
  thought,
  page,
}: {
  thought: PrivateThoughtPayload;
  page: number;
}) => {
  const queryClient = getQueryClient();
  const isHighlighted = !!thought.highlightedAt;

  queryClient.setQueryData<PrivateThoughtPayload[]>(
    adminThoughtsPageOptions(page).queryKey,
    (oldData) =>
      oldData?.map((oldThought) => {
        if (oldThought.id === thought.id) {
          return thought;
        }

        if (isHighlighted) {
          return { ...oldThought, highlightedAt: null, highlightedBy: null };
        }

        return oldThought;
      }),
  );

  queryClient.invalidateQueries({
    queryKey: adminThoughtsOptions.queryKey,
    refetchType: "none",
  });
};
