import type {
  PrivateThoughtFromServer,
  PrivateThoughtPayload,
  PublicThoughtFromServer,
  PublicThoughtPayload,
} from "@/types/thought";
import { getColorFallback } from "./color";
import { THOUGHT_HIGHLIGHT_LOCK_DURATION_MS } from "@/config/thought";

// Date data from the server HTTP response body is parsed as JSON,
// so date fields are strings and need to be converted to Date objects
export const parsePublicThoughtFromServer = (
  thought: PublicThoughtFromServer | PublicThoughtPayload,
): PublicThoughtPayload => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
    createdAt:
      thought.createdAt instanceof Date
        ? thought.createdAt
        : new Date(thought.createdAt),
  } satisfies PublicThoughtPayload;
};

export const parsePrivateThoughtFromServer = (
  thought: PrivateThoughtFromServer | PrivateThoughtPayload,
): PrivateThoughtPayload => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
    highlightedAt: thought.highlightedAt
      ? new Date(thought.highlightedAt)
      : null,
    createdAt:
      thought.createdAt instanceof Date
        ? thought.createdAt
        : new Date(thought.createdAt),
  } satisfies PrivateThoughtPayload;
};

export const isHighlightLocked = (highlightedAt: Date | null) => {
  if (!highlightedAt) return false;
  return (
    Date.now() - highlightedAt.getTime() < THOUGHT_HIGHLIGHT_LOCK_DURATION_MS
  );
};
