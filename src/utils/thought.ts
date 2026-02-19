import {
  addMilliseconds,
  differenceInMilliseconds,
  formatDistanceToNowStrict,
  isAfter,
} from "date-fns";
import { getColorFallback } from "./color";
import { THOUGHT_HIGHLIGHT_LOCK_DURATION_MS } from "@/config/thought";
import type {
  PrivateHighlightedThought,
  PrivateThought,
  PublicThought,
} from "@/types/thought";

export const parsePublicThoughtFromServer = (
  thought: PublicThought,
): PublicThought => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
  } satisfies PublicThought;
};

export const parsePrivateThoughtFromServer = (
  thought: PrivateThought,
): PrivateThought => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
  } satisfies PrivateThought;
};

export const parsePrivateHighlightedThoughtFromServer = (
  thought: PrivateHighlightedThought,
): PrivateHighlightedThought => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
  } satisfies PrivateHighlightedThought;
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
