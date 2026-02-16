import "client-only";

import {
  parsePrivateHighlightedThoughtFromServer,
  parsePrivateThoughtFromServer,
} from "@/utils/thought";
import { fetchJson } from "@/services/http";
import {
  PrivateHighlightedThoughtPayload,
  type PrivateThoughtPayload,
} from "@/types/thought";
import type { MessageResponse } from "@/types/http";

export const getAdminThoughts = async ({
  page,
}: {
  page: number;
}): Promise<PrivateThoughtPayload[]> => {
  const data = await fetchJson<PrivateThoughtPayload[]>(
    `/api/dashboard/thoughts?page=${page}`,
    undefined,
    { errorMessage: "Failed to get dashboard thoughts" },
  );

  return data.map(parsePrivateThoughtFromServer);
};

export const deleteThought = async (id: string) => {
  return fetchJson(
    `/api/dashboard/thoughts/${id}`,
    {
      method: "DELETE",
    },
    { errorMessage: "Failed to delete thought" },
  );
};

export const highlightThought = async (
  id: string,
): Promise<PrivateHighlightedThoughtPayload> => {
  const data = await fetchJson<PrivateHighlightedThoughtPayload>(
    `/api/dashboard/thoughts/${id}/highlight`,
    {
      method: "POST",
    },
    { errorMessage: "Failed to highlight thought" },
  );

  return parsePrivateHighlightedThoughtFromServer(data);
};

export const getHighlightedThought =
  async (): Promise<PrivateHighlightedThoughtPayload | null> => {
    const data = await fetchJson<PrivateHighlightedThoughtPayload | null>(
      `/api/dashboard/thoughts/highlight`,
      undefined,
      { errorMessage: "Failed to get highlighted thought" },
    );

    if (!data) {
      return null;
    }

    return parsePrivateHighlightedThoughtFromServer(data);
  };

export const removeThoughtHighlight = async (
  id: string,
): Promise<MessageResponse> => {
  return fetchJson<MessageResponse>(
    `/api/dashboard/thoughts/${id}/highlight`,
    {
      method: "DELETE",
    },
    { errorMessage: "Failed to remove highlight" },
  );
};
