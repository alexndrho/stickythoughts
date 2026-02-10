import "client-only";

import type { Prisma } from "@/generated/prisma/client";
import type { LetterReplyType, LetterType } from "@/types/letter";
import { fetchJson } from "@/services/http";

// letter
export const submitLetter = async (
  data: Omit<Prisma.LetterCreateInput, "author">,
): Promise<{ id: string }> => {
  return fetchJson(
    "/api/letters",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
      }),
    },
    { errorMessage: "Failed to submit letter post" },
  );
};

export const getLetter = async (
  id: string,
  cookie?: string,
): Promise<LetterType> => {
  return fetchJson(
    `/api/letters/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
    },
    { errorMessage: "Failed to get letter post" },
  );
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

  return fetchJson(
    `/api/letters?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    { errorMessage: "Failed to get letter posts" },
  );
};

export const updateLetter = async ({
  id,
  body,
}: {
  id: string;
  body: Prisma.LetterUpdateInput["body"];
}): Promise<LetterType> => {
  return fetchJson(
    `/api/letters/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: body,
      }),
    },
    { errorMessage: "Failed to update letter post" },
  );
};

export const deleteLetter = async (
  id: string,
): Promise<{ message: string }> => {
  return fetchJson(
    `/api/letters/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
    { errorMessage: "Failed to delete letter post" },
  );
};

// letter like
export const likeLetter = async (id: string): Promise<{ message: string }> => {
  return fetchJson(
    `/api/letters/${id}/like`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    { errorMessage: "Failed to like letter post" },
  );
};

export const unlikeLetter = async (
  id: string,
): Promise<{ message: string }> => {
  return fetchJson(
    `/api/letters/${id}/like`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
    { errorMessage: "Failed to unlike letter post" },
  );
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
  return fetchJson(
    `/api/letters/${id}/replies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body,
        isAnonymous,
      }),
    },
    { errorMessage: "Failed to submit reply" },
  );
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

  return fetchJson(
    `/api/letters/${id}/replies?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    { errorMessage: "Failed to get replies" },
  );
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
  return fetchJson(
    `/api/letters/${letterId}/replies/${replyId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body,
      }),
    },
    { errorMessage: "Failed to update reply" },
  );
};

export const deleteLetterReply = async ({
  letterId,
  replyId,
}: {
  letterId: string;
  replyId: string;
}) => {
  return fetchJson(
    `/api/letters/${letterId}/replies/${replyId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
    { errorMessage: "Failed to delete reply" },
  );
};

// reply like
export const likeLetterReply = async ({
  letterId,
  replyId,
}: {
  letterId: string;
  replyId: string;
}) => {
  return fetchJson(
    `/api/letters/${letterId}/replies/${replyId}/like`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
    { errorMessage: "Failed to like reply" },
  );
};

export const unlikeLetterReply = async ({
  letterId,
  replyId,
}: {
  letterId: string;
  replyId: string;
}) => {
  return fetchJson(
    `/api/letters/${letterId}/replies/${replyId}/like`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
    { errorMessage: "Failed to unlike reply" },
  );
};
