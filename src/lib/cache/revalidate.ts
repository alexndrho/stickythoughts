import { revalidateTag } from "next/cache";

import type { CacheTag } from "@/config/cache-tags";

export function revalidateTags(tags: CacheTag[]) {
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
}
