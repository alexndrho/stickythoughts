import 'client-only';

import { fetchJson } from '@/services/http';
import type { MessageResponse } from '@/types/http';
import type {
  PrivateHighlightedThought,
  PrivateHighlightedThoughtDTO,
  PrivateThought,
  PrivateThoughtDTO,
} from '@/types/thought';

export const getAdminThoughts = async ({ page }: { page: number }): Promise<PrivateThought[]> => {
  return fetchJson<PrivateThoughtDTO[]>(`/api/dashboard/thoughts?page=${page}`, undefined, {
    errorMessage: 'Failed to get dashboard thoughts',
  });
};

export const deleteThought = async (id: string) => {
  return fetchJson(
    `/api/dashboard/thoughts/${id}`,
    {
      method: 'DELETE',
    },
    { errorMessage: 'Failed to delete thought' },
  );
};

export const highlightThought = async (id: string): Promise<PrivateHighlightedThought> => {
  return fetchJson<PrivateHighlightedThoughtDTO>(
    `/api/dashboard/thoughts/${id}/highlight`,
    {
      method: 'POST',
    },
    { errorMessage: 'Failed to highlight thought' },
  );
};

export const getHighlightedThought = async (): Promise<PrivateHighlightedThought | null> => {
  return fetchJson<PrivateHighlightedThoughtDTO | null>(
    `/api/dashboard/thoughts/highlight`,
    undefined,
    { errorMessage: 'Failed to get highlighted thought' },
  );
};

export const removeThoughtHighlight = async (id: string): Promise<MessageResponse> => {
  return fetchJson<MessageResponse>(
    `/api/dashboard/thoughts/${id}/highlight`,
    {
      method: 'DELETE',
    },
    { errorMessage: 'Failed to remove highlight' },
  );
};
