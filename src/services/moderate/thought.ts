import { apiUrl } from "@/utils/text";
import { toServerError } from "@/utils/error/ServerError";
import {
  parsePublicThoughtFromServer,
  type PublicThoughtFromServer,
  type PublicThoughtPayload,
} from "@/utils/thought";

export const getAdminThoughts = async ({
  page,
}: {
  page: number;
}): Promise<PublicThoughtPayload[]> => {
  const response = await fetch(apiUrl(`/api/dashboard/thoughts?page=${page}`));
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get dashboard thoughts", data.issues);
  }

  return (data as PublicThoughtFromServer[]).map(parsePublicThoughtFromServer);
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
