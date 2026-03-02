import 'client-only';

import { parsePublicThoughtFromServer } from '@/utils/thought';
import { fetchJson } from '@/services/http';
import type { PublicThought, PublicThoughtDTO, SubmitThoughtBody } from '@/types/thought';

const getThoughts = async ({
  lastId,
  searchTerm,
}: {
  lastId?: string;
  searchTerm?: string;
}): Promise<PublicThought[]> => {
  const params = new URLSearchParams();

  if (lastId) {
    params.append('lastId', lastId);
  }
  if (searchTerm) {
    params.append('searchTerm', searchTerm);
  }

  const data = await fetchJson<PublicThoughtDTO[]>(
    `/api/thoughts${params.toString() ? `?${params.toString()}` : ''}`,
    undefined,
    { errorMessage: 'Failed to get thoughts' },
  );

  return data.map(parsePublicThoughtFromServer);
};

const submitThought = async (data: SubmitThoughtBody): Promise<PublicThought> => {
  const dto = await fetchJson<PublicThoughtDTO>(
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
  return parsePublicThoughtFromServer(dto);
};

const getThoughtsCount = async (): Promise<number> => {
  const data = await fetchJson<{ count: number }>('/api/thoughts/count', undefined, {
    errorMessage: 'Failed to get thoughts count',
  });

  return data.count;
};

const getHighlightedThought = async (): Promise<PublicThought | null> => {
  const data = await fetchJson<PublicThoughtDTO | null>('/api/thoughts/highlight', undefined, {
    errorMessage: 'Failed to get highlighted thought',
  });

  if (!data) return null;

  return parsePublicThoughtFromServer(data);
};

export { getThoughts, getThoughtsCount, submitThought, getHighlightedThought };
