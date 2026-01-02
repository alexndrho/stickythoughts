import { apiUrl } from "@/utils/text";
import { toServerError } from "@/utils/error/ServerError";

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
