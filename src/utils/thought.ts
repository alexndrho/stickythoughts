import {
  addMilliseconds,
  differenceInMilliseconds,
  formatDistanceToNowStrict,
  isAfter,
} from "date-fns";

import { THOUGHT_HIGHLIGHT_LOCK_DURATION_MS } from "@/config/thought";
import type {
  PrivateHighlightedThoughtPayload,
  PrivateThoughtPayload,
  PublicThoughtPayload,
} from "@/types/thought";
import { getColorFallback } from "./color";

export const parsePublicThoughtFromServer = (
  thought: PublicThoughtPayload,
): PublicThoughtPayload => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
  } satisfies PublicThoughtPayload;
};

export const parsePrivateThoughtFromServer = (
  thought: PrivateThoughtPayload,
): PrivateThoughtPayload => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
  } satisfies PrivateThoughtPayload;
};

export const parsePrivateHighlightedThoughtFromServer = (
  thought: PrivateHighlightedThoughtPayload,
): PrivateHighlightedThoughtPayload => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
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
