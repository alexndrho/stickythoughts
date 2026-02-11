import { CACHE_TAGS } from "@/config/cache-tags";

import { revalidateTags } from "./revalidate";

export function revalidateAllThoughts() {
  revalidateTags([
    CACHE_TAGS.PUBLIC_THOUGHT,
    CACHE_TAGS.PUBLIC_THOUGHT_COUNT,
    CACHE_TAGS.PUBLIC_THOUGHT_HIGHLIGHT,
  ]);
}

export function revalidateThoughts() {
  revalidateTags([CACHE_TAGS.PUBLIC_THOUGHT, CACHE_TAGS.PUBLIC_THOUGHT_COUNT]);
}

export function revalidateThoughtHighlight() {
  revalidateTags([CACHE_TAGS.PUBLIC_THOUGHT_HIGHLIGHT]);
}
