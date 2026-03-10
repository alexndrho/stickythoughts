import 'client-only';

import { fetchJson } from '@/services/http';
import type {
  SetSubmissionThoughtStatusBody,
  SubmissionThought,
  SubmissionThoughtDTO,
} from '@/types/thought-submission';
import type { SubmissionsType } from '@/types/submission';

const getTypeParam = (type: SubmissionsType) => {
  return `type=${type}`;
};

export const getSubmissionThoughts = async ({
  page,
  type,
}: {
  page: number;
  type: SubmissionsType;
}): Promise<SubmissionThought[]> => {
  return fetchJson<SubmissionThoughtDTO[]>(
    `/api/dashboard/submissions/thoughts?page=${page}&${getTypeParam(type)}`,
    undefined,
    { errorMessage: 'Failed to get thought submissions' },
  );
};

export const getSubmissionThoughtsCount = async ({
  type,
}: {
  type: SubmissionsType;
}): Promise<number> => {
  const data = await fetchJson<{ total: number }>(
    `/api/dashboard/submissions/thoughts/count?${getTypeParam(type)}`,
    undefined,
    { errorMessage: 'Failed to get thought submissions count' },
  );

  return Number(data?.total ?? 0);
};

export const setSubmissionThoughtStatus = async ({
  id,
  body,
}: {
  id: string;
  body: SetSubmissionThoughtStatusBody;
}) => {
  return fetchJson(
    `/api/dashboard/submissions/thoughts/${id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    { errorMessage: 'Failed to update thought status' },
  );
};

export const reopenSubmissionThought = async ({ id }: { id: string }) => {
  return fetchJson(
    `/api/dashboard/submissions/thoughts/${id}/reopen`,
    {
      method: 'PATCH',
    },
    { errorMessage: 'Failed to reopen thought submission' },
  );
};
