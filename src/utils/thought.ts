import {
  addMilliseconds,
  differenceInMilliseconds,
  formatDistanceToNowStrict,
  isAfter,
} from "date-fns";

import { THOUGHT_HIGHLIGHT_LOCK_DURATION_MS } from "@/config/thought";
import type {
  PrivateHighlightedThoughtFromServer,
  PrivateHighlightedThoughtPayload,
  PrivateThoughtFromServer,
  PrivateThoughtPayload,
  PublicThoughtFromServer,
  PublicThoughtPayload,
} from "@/types/thought";
import { getColorFallback } from "./color";

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
    createdAt:
      thought.createdAt instanceof Date
        ? thought.createdAt
        : new Date(thought.createdAt),
  } satisfies PrivateThoughtPayload;
};

export const parsePrivateHighlightedThoughtFromServer = (
  thought:
    | PrivateHighlightedThoughtFromServer
    | PrivateHighlightedThoughtPayload,
): PrivateHighlightedThoughtPayload => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
    highlightedAt:
      thought.highlightedAt instanceof Date
        ? thought.highlightedAt
        : new Date(thought.highlightedAt),
    createdAt:
      thought.createdAt instanceof Date
        ? thought.createdAt
        : new Date(thought.createdAt),
  } satisfies PrivateHighlightedThoughtPayload;
};

export const getHighlightedThoughtLockRemainingMs = (
  highlightedAt: Date,
  now = new Date(),
) => {
  const unlockAt = addMilliseconds(
    highlightedAt,
    THOUGHT_HIGHLIGHT_LOCK_DURATION_MS,
  );
  return Math.max(0, differenceInMilliseconds(unlockAt, now));
};

export const isHighlightedThoughtLocked = (
  highlightedAt: Date | null,
  now = new Date(),
) => {
  if (!highlightedAt) return false;
  const unlockAt = addMilliseconds(
    highlightedAt,
    THOUGHT_HIGHLIGHT_LOCK_DURATION_MS,
  );
  return isAfter(unlockAt, now);
};

export const formatHighlightedThoughtLockRemaining = (
  highlightedAt: Date | null,
  options?: {
    whenElapsed?: string;
  },
) => {
  if (!highlightedAt || !isHighlightedThoughtLocked(highlightedAt)) {
    return options?.whenElapsed ?? "now";
  }

  const unlockAt = addMilliseconds(
    highlightedAt,
    THOUGHT_HIGHLIGHT_LOCK_DURATION_MS,
  );
  const formatted = formatDistanceToNowStrict(unlockAt, {
    addSuffix: false,
  });

  return formatted || "less than a minute";
};
