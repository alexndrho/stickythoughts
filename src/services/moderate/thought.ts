import "client-only";

import {
  parsePrivateHighlightedThoughtFromServer,
  parsePrivateThoughtFromServer,
} from "@/utils/thought";
import { fetchJson } from "@/services/http";
import type { MessageResponse } from "@/types/http";
import {
  PrivateHighlightedThought,
  PrivateHighlightedThoughtDTO,
  type PrivateThought,
  type PrivateThoughtDTO,
} from "@/types/thought";

export const getAdminThoughts = async ({
  page,
}: {
  page: number;
}): Promise<PrivateThought[]> => {
  const data = await fetchJson<PrivateThoughtDTO[]>(
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
): Promise<PrivateHighlightedThought> => {
  const data = await fetchJson<PrivateHighlightedThoughtDTO>(
    `/api/dashboard/thoughts/${id}/highlight`,
    {
      method: "POST",
    },
    { errorMessage: "Failed to highlight thought" },
  );

  return parsePrivateHighlightedThoughtFromServer(data);
};

export const getHighlightedThought =
  async (): Promise<PrivateHighlightedThought | null> => {
    const data = await fetchJson<PrivateHighlightedThoughtDTO | null>(
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
