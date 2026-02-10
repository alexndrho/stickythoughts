import { apiUrl } from "@/utils/text";
import { toServerError } from "@/utils/error/ServerError";
import { parsePrivateThoughtFromServer } from "@/utils/thought";
import {
  type PrivateThoughtFromServer,
  type PrivateThoughtPayload,
} from "@/types/thought";

export const getAdminThoughts = async ({
  page,
}: {
  page: number;
}): Promise<PrivateThoughtPayload[]> => {
  const response = await fetch(apiUrl(`/api/dashboard/thoughts?page=${page}`));
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get dashboard thoughts", data.issues);
  }

  return (data as PrivateThoughtFromServer[]).map(
    parsePrivateThoughtFromServer,
  );
};

export const deleteThought = async (id: string) => {
  const response = await fetch(apiUrl(`/api/thoughts/${id}`), {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to delete thought", data.issues);
  }

  return data;
};

export const highlightThought = async (
  id: string,
): Promise<PrivateThoughtPayload> => {
  const response = await fetch(
    apiUrl(`/api/dashboard/thoughts/${id}/highlight`),
    {
      method: "POST",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to highlight thought", data.issues);
  }

  return parsePrivateThoughtFromServer(data);
};

export const removeThoughtHighlight = async (
  id: string,
): Promise<PrivateThoughtPayload> => {
  const response = await fetch(
    apiUrl(`/api/dashboard/thoughts/${id}/highlight`),
    {
      method: "DELETE",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to remove highlight", data.issues);
  }

  return parsePrivateThoughtFromServer(data);
};
