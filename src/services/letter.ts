import type { Prisma } from "@/generated/prisma/client";
import { toServerError } from "@/utils/error/ServerError";
import type { LetterReplyType, LetterType } from "@/types/letter";
import { apiUrl } from "@/utils/text";

// letter
export const submitLetter = async (
  data: Omit<Prisma.LetterCreateInput, "author">,
): Promise<{ id: string }> => {
  const response = await fetch(apiUrl("/api/letters"), {
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
    throw toServerError("Failed to submit letter post", dataResponse.issues);
  }

  return dataResponse;
};

export const getLetter = async (
  id: string,
  cookie?: string,
): Promise<LetterType> => {
  const response = await fetch(apiUrl(`/api/letters/${id}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get letter post", dataResponse.issues);
  }

  return dataResponse;
};

export const getLetters = async ({
  lastId,
}: {
  lastId?: string;
}): Promise<LetterType[]> => {
  const params = new URLSearchParams();

  if (lastId) {
    params.append("lastId", lastId);
  }

  const response = await fetch(apiUrl(`/api/letters?${params}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get letter posts", dataResponse.issues);
  }

  return dataResponse;
};

export const updateLetter = async ({
  id,
  body,
}: {
  id: string;
  body: Prisma.LetterUpdateInput["body"];
}): Promise<LetterType> => {
  const response = await fetch(apiUrl(`/api/letters/${id}`), {
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
    throw toServerError("Failed to update letter post", data.issues);
  }

  return data;
};

export const deleteLetter = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await fetch(apiUrl(`/api/letters/${id}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to delete letter post", data.issues);
  }

  return data;
};

// letter like
export const likeLetter = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(apiUrl(`/api/letters/${id}/like`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to like letter post", data.issues);
  }

  return data;
};

export const unlikeLetter = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await fetch(apiUrl(`/api/letters/${id}/like`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to unlike letter post", data.issues);
  }

  return data;
};

// reply
export const submitLetterReply = async ({
  id,
  body,
  isAnonymous,
}: {
  id: string;
  body: Prisma.LetterCreateInput["body"];
  isAnonymous?: boolean;
}): Promise<LetterReplyType> => {
  const response = await fetch(apiUrl(`/api/letters/${id}/replies`), {
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
    throw toServerError("Failed to submit reply", dataResponse.issues);
  }

  return dataResponse;
};

export const getLetterReplies = async ({
  id,
  lastId,
}: {
  id: string;
  lastId?: string;
}): Promise<LetterReplyType[]> => {
  const params = new URLSearchParams();

  if (lastId) {
    params.append("lastId", lastId);
  }

  const response = await fetch(
    apiUrl(`/api/letters/${id}/replies?${params}`),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to get replies", dataResponse.issues);
  }

  return dataResponse;
};

export const updateLetterReply = async ({
  letterId,
  replyId,
  body,
}: {
  letterId: string;
  replyId: string;
  body: string;
}): Promise<LetterReplyType> => {
  const response = await fetch(
    apiUrl(`/api/letters/${letterId}/replies/${replyId}`),
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
    throw toServerError("Failed to update reply", dataResponse.issues);
  }

  return dataResponse;
};

export const deleteLetterReply = async ({
  letterId,
  replyId,
}: {
  letterId: string;
  replyId: string;
}) => {
  const response = await fetch(
    apiUrl(`/api/letters/${letterId}/replies/${replyId}`),
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to delete reply", dataResponse.issues);
  }

  return dataResponse;
};

// reply like
export const likeLetterReply = async ({
  letterId,
  replyId,
}: {
  letterId: string;
  replyId: string;
}) => {
  const response = await fetch(
    apiUrl(`/api/letters/${letterId}/replies/${replyId}/like`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to like reply", dataResponse.issues);
  }

  return dataResponse;
};

export const unlikeLetterReply = async ({
  letterId,
  replyId,
}: {
  letterId: string;
  replyId: string;
}) => {
  const response = await fetch(
    apiUrl(`/api/letters/${letterId}/replies/${replyId}/like`),
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const dataResponse = await response.json();

  if (!response.ok) {
    throw toServerError("Failed to unlike reply", dataResponse.issues);
  }

  return dataResponse;
};
