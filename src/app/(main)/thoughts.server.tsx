import {
  dehydrate,
  HydrationBoundary,
  type InfiniteData,
} from "@tanstack/react-query";

import { getQueryClient } from "@/lib/get-query-client";
import { thoughtKeys } from "@/lib/query-keys";
import { listPublicThoughts } from "@/server/thought";
import { filterText } from "@/utils/text";
import { getColorFallback } from "@/utils/color";
import Thoughts from "./thoughts";

export default async function ThoughtsServer() {
  const queryClient = getQueryClient();

  const thoughts = (await listPublicThoughts({})).map((thought) => ({
    ...thought,
    message: filterText(thought.message),
    author: filterText(thought.author),
    color: getColorFallback(thought.color),
  }));

  queryClient.setQueryData(thoughtKeys.infinite(), {
    pages: [thoughts],
    pageParams: [undefined],
  } satisfies InfiniteData<(typeof thoughts)[number][]>);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Thoughts />
    </HydrationBoundary>
  );
}
