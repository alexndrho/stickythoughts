import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { thoughtKeys } from "@/lib/query-keys";
import { countPublicThoughts } from "@/server/thought";
import ThoughtCountClient from "./thought-count.client";

export default async function ThoughtCountServer() {
  const queryClient = getQueryClient();

  const thoughtCount = await countPublicThoughts();
  queryClient.setQueryData(thoughtKeys.count(), thoughtCount);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ThoughtCountClient />
    </HydrationBoundary>
  );
}
