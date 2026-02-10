import "client-only";

import type {
  SearchAllType,
  SearchSegmentType,
  SearchLetterType,
  SearchUserType,
} from "@/types/search";
import { fetchJson } from "@/services/http";

type SearchResultMap = {
  users: SearchUserType[];
  letters: SearchLetterType[];
  all: SearchAllType[];
};

export async function getSearchResults<T extends SearchSegmentType = "all">(
  query: string,
  type?: T,
): Promise<
  T extends keyof SearchResultMap ? SearchResultMap[T] : SearchAllType[]
> {
  if (!query.trim()) {
    return [] as unknown as T extends keyof SearchResultMap
      ? SearchResultMap[T]
      : SearchAllType[];
  }

  const params = new URLSearchParams();
  params.append("q", query);
  if (type) {
    params.append("type", type);
  }

  return fetchJson(`/api/search?${params.toString()}`, undefined, {
    errorMessage: "Failed to fetch search results",
  });
}
