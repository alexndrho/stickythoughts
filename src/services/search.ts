import "client-only";

import { fetchJson } from "@/services/http";
import type {
  SearchResultDTOMap,
  SearchResultMap,
  SearchSegmentType,
} from "@/types/search";

export async function getSearchResults<T extends SearchSegmentType = "all">(
  query: string,
  type?: T,
): Promise<SearchResultMap[T]> {
  if (!query.trim()) {
    return [] as SearchResultMap[T];
  }

  const params = new URLSearchParams();
  params.append("q", query);
  if (type) {
    params.append("type", type);
  }

  const data = await fetchJson<SearchResultDTOMap[T]>(
    `/api/search?${params.toString()}`,
    undefined,
    {
      errorMessage: "Failed to fetch search results",
    },
  );

  return data as SearchResultMap[T];
}
