import 'client-only';

import { fetchJson } from '@/services/http';
import type {
  SetSubmissionLetterStatusBody,
  SubmissionLetter,
  SubmissionLetterDTO,
  SubmissionsType,
} from '@/types/submission';

const getTypeParam = (type: SubmissionsType) => {
  return `type=${type}`;
};

export const getSubmissionLetters = async ({
  page,
  type,
}: {
  page: number;
  type: SubmissionsType;
}): Promise<SubmissionLetter[]> => {
  return fetchJson<SubmissionLetterDTO[]>(
    `/api/dashboard/submissions/letters?page=${page}&${getTypeParam(type)}`,
    undefined,
    { errorMessage: 'Failed to get letters submissions' },
  );
};

export const getSubmissionLettersCount = async ({
  type,
}: {
  type: SubmissionsType;
}): Promise<number> => {
  const data = await fetchJson<{ total: number }>(
    `/api/dashboard/submissions/letters/count?${getTypeParam(type)}`,
    undefined,
    { errorMessage: 'Failed to get submissions count' },
  );

  return Number(data?.total ?? 0);
};

export const setSubmissionLetterStatus = async ({
  id,
  body,
}: {
  id: string;
  body: SetSubmissionLetterStatusBody;
}) => {
  return fetchJson(
    `/api/dashboard/submissions/letters/${id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    { errorMessage: 'Failed to update letter status' },
  );
};

export const reopenSubmissionLetter = async ({ id }: { id: string }) => {
  return fetchJson(
    `/api/dashboard/submissions/letters/${id}/reopen`,
    {
      method: 'PATCH',
    },
    { errorMessage: 'Failed to reopen letter submission' },
  );
};
