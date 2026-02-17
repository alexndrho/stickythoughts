import "client-only";

import type { LetterStatus } from "@/generated/prisma/client";
import { fetchJson } from "@/services/http";
import type { SubmissionLetterFromServer } from "@/types/submission";

const getStatusParam = (status: "PENDING" | "REJECTED") => {
  return `status=${status}`;
};

export const getSubmissionLetters = async ({
  page,
  status,
}: {
  page: number;
  status: "PENDING" | "REJECTED";
}): Promise<SubmissionLetterFromServer[]> => {
  return fetchJson(
    `/api/dashboard/submissions/letters?page=${page}&${getStatusParam(status)}`,
    undefined,
    { errorMessage: "Failed to get letters submissions" },
  );
};

export const getSubmissionLettersCount = async ({
  status,
}: {
  status: "PENDING" | "REJECTED";
}): Promise<number> => {
  const data = await fetchJson<{ total: number }>(
    `/api/dashboard/submissions/letters/count?${getStatusParam(status)}`,
    undefined,
    { errorMessage: "Failed to get submissions count" },
  );

  return Number(data?.total ?? 0);
};

export const setSubmissionLetterStatus = async ({
  id,
  status,
}: {
  id: string;
  status: Extract<LetterStatus, "APPROVED" | "REJECTED">;
}) => {
  return fetchJson(
    `/api/dashboard/submissions/letters/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
    { errorMessage: "Failed to update letter status" },
  );
};

export const reopenSubmissionLetter = async ({ id }: { id: string }) => {
  return fetchJson(
    `/api/dashboard/submissions/letters/${id}/reopen`,
    {
      method: "PATCH",
    },
    { errorMessage: "Failed to reopen letter submission" },
  );
};
