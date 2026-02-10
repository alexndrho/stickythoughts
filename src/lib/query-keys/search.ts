import type { SearchSegmentType } from "@/types/search";

export const searchKeys = {
  all: () => ["search"] as const,
  results: (input: { query: string; type?: SearchSegmentType }) =>
    [...searchKeys.all(), input.query, input.type] as const,
};

