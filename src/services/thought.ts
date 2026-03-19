import 'client-only';

import { fetchJson } from '@/services/http';
import type {
  PublicThought,
  PublicThoughtDTO,
  SubmitThoughtBody,
  SubmitThoughtResponse,
  SubmitThoughtResponseDTO,
  ThoughtsSort,
} from '@/types/thought';

const getThoughts = async ({
  searchTerm,
  sort,
  lastId,
  seed,
}: {
  searchTerm?: string;
  sort: ThoughtsSort;
  lastId?: string;
  seed?: string;
}): Promise<PublicThought[]> => {
  const params = new URLSearchParams();

  if (lastId) {
    params.append('lastId', lastId);
  }
  if (sort) {
    params.append('sort', sort);
  }
  if (searchTerm) {
    params.append('searchTerm', searchTerm);
  }
  if (seed) {
    params.append('seed', seed);
  }

  const data = await fetchJson<PublicThoughtDTO[]>(
    `/api/thoughts${params.toString() ? `?${params.toString()}` : ''}`,
    undefined,
    { errorMessage: 'Failed to get thoughts' },
  );

  return data;
};

const submitThought = async (data: SubmitThoughtBody): Promise<SubmitThoughtResponse> => {
  return fetchJson<SubmitThoughtResponseDTO>(
    '/api/thoughts',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
    { errorMessage: 'Failed to submit thought' },
  );
};

const getThoughtsCount = async (): Promise<number> => {
  const data = await fetchJson<{ count: number }>('/api/thoughts/count', undefined, {
    errorMessage: 'Failed to get thoughts count',
  });

  return data.count;
};

const getHighlightedThought = async (): Promise<PublicThought | null> => {
  return fetchJson<PublicThoughtDTO | null>('/api/thoughts/highlight', undefined, {
    errorMessage: 'Failed to get highlighted thought',
  });
};

export { getThoughts, getThoughtsCount, submitThought, getHighlightedThought };
