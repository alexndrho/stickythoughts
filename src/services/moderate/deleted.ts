import "client-only";

import { fetchJson } from "@/services/http";
import { getColorFallback } from "@/utils/color";
import type {
  DeletedThoughtFromServer,
  DeletedLetterFromServer,
  DeletedLetterReplyFromServer,
} from "@/types/deleted";

export const getDeletedThoughts = async ({
  page,
}: {
  page: number;
}): Promise<DeletedThoughtFromServer[]> => {
  const data = await fetchJson<DeletedThoughtFromServer[]>(
    `/api/dashboard/deleted/thoughts?page=${page}`,
    undefined,
    { errorMessage: "Failed to get deleted thoughts" },
  );

  return data.map((thought) => ({
    ...thought,
    color: getColorFallback(thought.color),
  }));
};

export const getDeletedLetters = async ({
  page,
}: {
  page: number;
}): Promise<DeletedLetterFromServer[]> => {
  return fetchJson(`/api/dashboard/deleted/letters?page=${page}`, undefined, {
    errorMessage: "Failed to get deleted letters",
  });
};

export const getDeletedLetterReplies = async ({
  page,
}: {
  page: number;
}): Promise<DeletedLetterReplyFromServer[]> => {
  return fetchJson(`/api/dashboard/deleted/replies?page=${page}`, undefined, {
    errorMessage: "Failed to get deleted replies",
  });
};

export const getDeletedThoughtsCount = async (): Promise<number> => {
  const data = await fetchJson<{ total: number }>(
    "/api/dashboard/deleted/thoughts/count",
    undefined,
    { errorMessage: "Failed to get deleted thoughts count" },
  );

  return Number(data?.total ?? 0);
};

export const getDeletedLettersCount = async (): Promise<number> => {
  const data = await fetchJson<{ total: number }>(
    "/api/dashboard/deleted/letters/count",
    undefined,
    { errorMessage: "Failed to get deleted letters count" },
  );

  return Number(data?.total ?? 0);
};

export const getDeletedRepliesCount = async (): Promise<number> => {
  const data = await fetchJson<{ total: number }>(
    "/api/dashboard/deleted/replies/count",
    undefined,
    { errorMessage: "Failed to get deleted replies count" },
  );

  return Number(data?.total ?? 0);
};

export const restoreDeletedThought = async (id: string) => {
  return fetchJson(
    `/api/dashboard/deleted/thoughts/${id}`,
    {
      method: "PATCH",
    },
    { errorMessage: "Failed to restore thought" },
  );
};

export const permanentlyDeleteThought = async (id: string) => {
  return fetchJson(
    `/api/dashboard/deleted/thoughts/${id}`,
    {
      method: "DELETE",
    },
    { errorMessage: "Failed to delete thought permanently" },
  );
};

export const restoreDeletedLetter = async (id: string) => {
  return fetchJson(
    `/api/dashboard/deleted/letters/${id}`,
    {
      method: "PATCH",
    },
    { errorMessage: "Failed to restore letter" },
  );
};

export const permanentlyDeleteLetter = async (id: string) => {
  return fetchJson(
    `/api/dashboard/deleted/letters/${id}`,
    {
      method: "DELETE",
    },
    { errorMessage: "Failed to delete letter permanently" },
  );
};

export const restoreDeletedReply = async (id: string) => {
  return fetchJson(
    `/api/dashboard/deleted/replies/${id}`,
    {
      method: "PATCH",
    },
    { errorMessage: "Failed to restore reply" },
  );
};

export const permanentlyDeleteReply = async (id: string) => {
  return fetchJson(
    `/api/dashboard/deleted/replies/${id}`,
    {
      method: "DELETE",
    },
    { errorMessage: "Failed to delete reply permanently" },
  );
};
