import type { Prisma } from "@/generated/prisma/client";
import { toServerError } from "@/utils/error/ServerError";
import type { ThreadCommentType, ThreadType } from "@/types/thread";
import { apiUrl } from "@/utils/text";

// thread
export const submitThread = async (
  data: Omit<Prisma.ThreadCreateInput, "author">,
): Promise<{ id: string }> => {
  const response = await fetch(apiUrl("/api/threads"), {
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
    throw toServerError("Failed to submit thread post", dataResponse.issues);
  }

  return dataResponse;
};

export const getThread = async (
  id: string,
  cookie?: string,
): Promise<ThreadType> => {
  const response = await fetch(apiUrl(`/api/threads/${id}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get thread post", dataResponse.issues);
  }

  return dataResponse;
};

export const getThreads = async ({
  lastId,
}: {
  lastId?: string;
}): Promise<ThreadType[]> => {
  const params = new URLSearchParams();

  if (lastId) {
    params.append("lastId", lastId);
  }

  const response = await fetch(apiUrl(`/api/threads?${params}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get thread posts", dataResponse.issues);
  }

  return dataResponse;
};

export const updateThread = async ({
  id,
  body,
}: {
  id: string;
  body: Prisma.ThreadUpdateInput["body"];
}): Promise<ThreadType> => {
  const response = await fetch(apiUrl(`/api/threads/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body: body,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to update thread post", data.issues);
  }

  return data;
};

export const deleteThread = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await fetch(apiUrl(`/api/threads/${id}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to delete thread post", data.issues);
  }

  return data;
};

// thread like
export const likeThread = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(apiUrl(`/api/threads/${id}/like`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to like thread post", data.issues);
  }

  return data;
};

export const unlikeThread = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await fetch(apiUrl(`/api/threads/${id}/like`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to unlike thread post", data.issues);
  }

  return data;
};

// comment
export const submitThreadComment = async ({
  id,
  body,
  isAnonymous,
}: {
  id: string;
  body: Prisma.ThreadCreateInput["body"];
  isAnonymous?: boolean;
}): Promise<ThreadCommentType> => {
  const response = await fetch(apiUrl(`/api/threads/${id}/comments`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      body,
      isAnonymous,
    }),
  });

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to submit comment", dataResponse.issues);
  }

  return dataResponse;
};

export const getThreadComments = async ({
  id,
  lastId,
}: {
  id: string;
  lastId?: string;
}): Promise<ThreadCommentType[]> => {
  const params = new URLSearchParams();

  if (lastId) {
    params.append("lastId", lastId);
  }

  const response = await fetch(
    apiUrl(`/api/threads/${id}/comments?${params}`),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get comments", dataResponse.issues);
  }

  return dataResponse;
};

export const updateThreadComment = async ({
  threadId,
  commentId,
  body,
}: {
  threadId: string;
  commentId: string;
  body: string;
}): Promise<ThreadCommentType> => {
  const response = await fetch(
    apiUrl(`/api/threads/${threadId}/comments/${commentId}`),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body,
      }),
    },
  );

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to update comment", dataResponse.issues);
  }

  return dataResponse;
};

export const deleteThreadComment = async ({
  threadId,
  commentId,
}: {
  threadId: string;
  commentId: string;
}) => {
  const response = await fetch(
    apiUrl(`/api/threads/${threadId}/comments/${commentId}`),
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to delete comment", dataResponse.issues);
  }

  return dataResponse;
};

// comment like
export const likeThreadComment = async ({
  threadId,
  commentId,
}: {
  threadId: string;
  commentId: string;
}) => {
  const response = await fetch(
    apiUrl(`/api/threads/${threadId}/comments/${commentId}/like`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to like comment", dataResponse.issues);
  }

  return dataResponse;
};

export const unlikeThreadComment = async ({
  threadId,
  commentId,
}: {
  threadId: string;
  commentId: string;
}) => {
  const response = await fetch(
    apiUrl(`/api/threads/${threadId}/comments/${commentId}/like`),
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to unlike comment", dataResponse.issues);
  }

  return dataResponse;
};
