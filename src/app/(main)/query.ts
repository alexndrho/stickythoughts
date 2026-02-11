import "server-only";

import { unstable_cache } from "next/cache";

import { thoughtCacheTags } from "@/lib/cache-tags";
import type { PublicThoughtPayload } from "@/types/thought";
import {
  countPublicThoughts as countPublicThoughtsService,
  listPublicThoughts as listPublicThoughtsService,
} from "@/server/thought/thoughts-service";
import {
  getHighlightedThought as getHighlightedThoughtService,
  type HighlightedThought,
} from "@/server/thought/thought-highlight-service";

const listPublicThoughtsCached = unstable_cache(
  async () => listPublicThoughtsService({}),
  ["public-thought-list"],
  {
    tags: [thoughtCacheTags.publicList],
  },
);

const countPublicThoughtsCached = unstable_cache(
  async () => countPublicThoughtsService(),
  ["public-thought-count"],
  {
    tags: [thoughtCacheTags.publicCount],
  },
);

const getHighlightedThoughtCached = unstable_cache(
  async () => getHighlightedThoughtService(),
  ["public-thought-highlight"],
  {
    tags: [thoughtCacheTags.publicHighlight],
  },
);

export async function listPublicThoughts(): Promise<PublicThoughtPayload[]> {
  return listPublicThoughtsCached();
}

export async function countPublicThoughts(): Promise<number> {
  return countPublicThoughtsCached();
}

export async function getHighlightedThought(): Promise<HighlightedThought | null> {
  return getHighlightedThoughtCached();
}
