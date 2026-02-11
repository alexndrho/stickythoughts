import "client-only";

import { parsePrivateThoughtFromServer } from "@/utils/thought";
import { fetchJson } from "@/services/http";
import {
  type PrivateThoughtFromServer,
  type PrivateThoughtPayload,
} from "@/types/thought";

export const getAdminThoughts = async ({
  page,
}: {
  page: number;
}): Promise<PrivateThoughtPayload[]> => {
  const data = await fetchJson<PrivateThoughtFromServer[]>(
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
): Promise<PrivateThoughtPayload> => {
  const data = await fetchJson<PrivateThoughtFromServer>(
    `/api/dashboard/thoughts/${id}/highlight`,
    {
      method: "POST",
    },
    { errorMessage: "Failed to highlight thought" },
  );

  return parsePrivateThoughtFromServer(data);
};

export const removeThoughtHighlight = async (
  id: string,
): Promise<PrivateThoughtPayload> => {
  const data = await fetchJson<PrivateThoughtFromServer>(
    `/api/dashboard/thoughts/${id}/highlight`,
    {
      method: "DELETE",
    },
    { errorMessage: "Failed to remove highlight" },
  );

  return parsePrivateThoughtFromServer(data);
};
