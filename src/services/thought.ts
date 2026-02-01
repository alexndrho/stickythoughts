import type { Prisma } from "@/generated/prisma/client";
import {
  parsePublicThoughtFromServer,
  PublicThoughtFromServer,
  PublicThoughtPayload,
} from "@/utils/thought";
import { toServerError } from "@/utils/error/ServerError";
import { apiUrl } from "@/utils/text";

const getThoughts = async ({
  lastId,
  page,
  searchTerm,
}: {
  lastId?: string;
  page?: number;
  searchTerm?: string;
}): Promise<PublicThoughtPayload[]> => {
  const params = new URLSearchParams();

  if (lastId) {
    params.append("lastId", lastId);
  }
  if (page) {
    params.append("page", page.toString());
  }
  if (searchTerm) {
    params.append("searchTerm", searchTerm);
  }

  const response = await fetch(
    apiUrl(`/api/thoughts${params.toString() ? `?${params.toString()}` : ""}`),
  );

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get thoughts", data.issues);
  }

  return data.map(parsePublicThoughtFromServer);
};

const submitThought = async (
  data: Prisma.ThoughtCreateInput,
): Promise<{ message: string }> => {
  const response = await fetch(apiUrl("/api/thoughts"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
    }),
  });

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to submit thought", dataResponse.issues);
  }

  return dataResponse;
};

const getThoughtsCount = async (): Promise<number> => {
  const response = await fetch(apiUrl("/api/thoughts/count"));
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get thoughts count", data.issues);
  }

  return data.count;
};

// const searchThoughts = async (searchTerm: string): Promise<Thought[]> => {
//   const response = await fetch(
//     `/api/thoughts?searchTerm=${encodeURIComponent(searchTerm)}`,
//   );

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.issues[0].message);
//   }

//   return data.map(convertThoughtDates);
// };

export { getThoughts, getThoughtsCount, submitThought };

export type { PublicThoughtFromServer, PublicThoughtPayload };
