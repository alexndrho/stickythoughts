import { apiUrl } from "@/utils/text";
import type {
  SearchAllType,
  SearchSegmentType,
  SearchLetterType,
  SearchUserType,
} from "@/types/search";
import { toServerError } from "@/utils/error/ServerError";

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

  const response = await fetch(apiUrl(`/api/search?${params.toString()}`));

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to fetch search results", dataResponse.issues);
  }

  return dataResponse;
}
