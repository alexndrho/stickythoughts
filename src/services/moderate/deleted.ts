import { apiUrl } from "@/utils/text";
import { toServerError } from "@/utils/error/ServerError";
import { parsePublicThoughtFromServer } from "@/utils/thought";
import type { PublicThoughtFromServer } from "@/types/thought";
import type {
  DeletedThoughtFromServer,
  DeletedThought,
  DeletedLetterFromServer,
  DeletedLetterReplyFromServer,
} from "@/types/deleted";

export const getDeletedThoughts = async ({
  page,
}: {
  page: number;
}): Promise<DeletedThought[]> => {
  const response = await fetch(
    apiUrl(`/api/dashboard/deleted/thoughts?page=${page}`),
  );
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted thoughts", data.issues);
  }

  return (data as DeletedThoughtFromServer[]).map((thought) => ({
    ...parsePublicThoughtFromServer(
      thought as unknown as PublicThoughtFromServer,
    ),
    deletedAt: thought.deletedAt ? new Date(thought.deletedAt) : null,
    deletedBy: thought.deletedBy,
    deletedById: thought.deletedById,
  })) satisfies DeletedThought[];
};

export const getDeletedLetters = async ({
  page,
}: {
  page: number;
}): Promise<DeletedLetterFromServer[]> => {
  const response = await fetch(
    apiUrl(`/api/dashboard/deleted/letters?page=${page}`),
  );
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted letters", data.issues);
  }

  return data;
};

export const getDeletedLetterReplies = async ({
  page,
}: {
  page: number;
}): Promise<DeletedLetterReplyFromServer[]> => {
  const response = await fetch(
    apiUrl(`/api/dashboard/deleted/replies?page=${page}`),
  );
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted replies", data.issues);
  }

  return data as DeletedLetterReplyFromServer[];
};

export const getDeletedThoughtsCount = async (): Promise<number> => {
  const response = await fetch(apiUrl("/api/dashboard/deleted/thoughts/count"));
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted thoughts count", data.issues);
  }

  return Number(data?.total ?? 0);
};

export const getDeletedLettersCount = async (): Promise<number> => {
  const response = await fetch(apiUrl("/api/dashboard/deleted/letters/count"));
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted letters count", data.issues);
  }

  return Number(data?.total ?? 0);
};

export const getDeletedRepliesCount = async (): Promise<number> => {
  const response = await fetch(apiUrl("/api/dashboard/deleted/replies/count"));
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted replies count", data.issues);
  }

  return Number(data?.total ?? 0);
};

export const restoreDeletedThought = async (id: string) => {
  const response = await fetch(
    apiUrl(`/api/dashboard/deleted/thoughts/${id}`),
    {
      method: "PATCH",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to restore thought", data.issues);
  }

  return data;
};

export const permanentlyDeleteThought = async (id: string) => {
  const response = await fetch(
    apiUrl(`/api/dashboard/deleted/thoughts/${id}`),
    {
      method: "DELETE",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to delete thought permanently", data.issues);
  }

  return data;
};

export const restoreDeletedLetter = async (id: string) => {
  const response = await fetch(apiUrl(`/api/dashboard/deleted/letters/${id}`), {
    method: "PATCH",
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to restore letter", data.issues);
  }

  return data;
};

export const permanentlyDeleteLetter = async (id: string) => {
  const response = await fetch(apiUrl(`/api/dashboard/deleted/letters/${id}`), {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to delete letter permanently", data.issues);
  }

  return data;
};

export const restoreDeletedReply = async (id: string) => {
  const response = await fetch(apiUrl(`/api/dashboard/deleted/replies/${id}`), {
    method: "PATCH",
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to restore reply", data.issues);
  }

  return data;
};

export const permanentlyDeleteReply = async (id: string) => {
  const response = await fetch(apiUrl(`/api/dashboard/deleted/replies/${id}`), {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to delete reply permanently", data.issues);
  }

  return data;
};
