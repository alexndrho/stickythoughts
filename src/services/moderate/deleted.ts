import { apiUrl } from "@/utils/text";
import { toServerError } from "@/utils/error/ServerError";
import {
  parsePublicThoughtFromServer,
  type PublicThoughtFromServer,
} from "@/utils/thought";
import type {
  DeletedThoughtFromServer,
  DeletedThought,
  DeletedThreadFromServer,
  DeletedThreadCommentFromServer,
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

export const getDeletedThreads = async ({
  page,
}: {
  page: number;
}): Promise<DeletedThreadFromServer[]> => {
  const response = await fetch(
    apiUrl(`/api/dashboard/deleted/threads?page=${page}`),
  );
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted threads", data.issues);
  }

  return data;
};

export const getDeletedThreadComments = async ({
  page,
}: {
  page: number;
}): Promise<DeletedThreadCommentFromServer[]> => {
  const response = await fetch(
    apiUrl(`/api/dashboard/deleted/comments?page=${page}`),
  );
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted comments", data.issues);
  }

  return data as DeletedThreadCommentFromServer[];
};

export const getDeletedThoughtsCount = async (): Promise<number> => {
  const response = await fetch(apiUrl("/api/dashboard/deleted/thoughts/count"));
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted thoughts count", data.issues);
  }

  return Number(data?.total ?? 0);
};

export const getDeletedThreadsCount = async (): Promise<number> => {
  const response = await fetch(apiUrl("/api/dashboard/deleted/threads/count"));
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted threads count", data.issues);
  }

  return Number(data?.total ?? 0);
};

export const getDeletedCommentsCount = async (): Promise<number> => {
  const response = await fetch(apiUrl("/api/dashboard/deleted/comments/count"));
  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get deleted comments count", data.issues);
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

export const restoreDeletedThread = async (id: string) => {
  const response = await fetch(apiUrl(`/api/dashboard/deleted/threads/${id}`), {
    method: "PATCH",
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to restore thread", data.issues);
  }

  return data;
};

export const permanentlyDeleteThread = async (id: string) => {
  const response = await fetch(apiUrl(`/api/dashboard/deleted/threads/${id}`), {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to delete thread permanently", data.issues);
  }

  return data;
};

export const restoreDeletedComment = async (id: string) => {
  const response = await fetch(
    apiUrl(`/api/dashboard/deleted/comments/${id}`),
    {
      method: "PATCH",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to restore comment", data.issues);
  }

  return data;
};

export const permanentlyDeleteComment = async (id: string) => {
  const response = await fetch(
    apiUrl(`/api/dashboard/deleted/comments/${id}`),
    {
      method: "DELETE",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to delete comment permanently", data.issues);
  }

  return data;
};
