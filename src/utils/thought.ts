import {
  addMilliseconds,
  differenceInMilliseconds,
  formatDistanceToNowStrict,
  isAfter,
} from 'date-fns';

import type { ThoughtPattern } from '@/generated/prisma/enums';
import { THOUGHT_HIGHLIGHT_LOCK_DURATION_MS } from '@/config/thought';

export const getHighlightedThoughtLockRemainingMs = (highlightedAt: Date, now = new Date()) => {
  const unlockAt = addMilliseconds(highlightedAt, THOUGHT_HIGHLIGHT_LOCK_DURATION_MS);
  return Math.max(0, differenceInMilliseconds(unlockAt, now));
};

export const isHighlightedThoughtLocked = (highlightedAt: Date | null, now = new Date()) => {
  if (!highlightedAt) return false;
  const unlockAt = addMilliseconds(highlightedAt, THOUGHT_HIGHLIGHT_LOCK_DURATION_MS);
  return isAfter(unlockAt, now);
};

export const formatHighlightedThoughtLockRemaining = (
  highlightedAt: Date | null,
  options?: {
    whenElapsed?: string;
  },
) => {
  if (!highlightedAt || !isHighlightedThoughtLocked(highlightedAt)) {
    return options?.whenElapsed ?? 'now';
  }

  const unlockAt = addMilliseconds(highlightedAt, THOUGHT_HIGHLIGHT_LOCK_DURATION_MS);
  const formatted = formatDistanceToNowStrict(unlockAt, {
    addSuffix: false,
  });

  return formatted || 'less than a minute';
};

const PATTERN_STYLES: Record<
  Exclude<ThoughtPattern, 'PLAIN'>,
  { backgroundImage: string; backgroundSize?: string }
> = {
  LINED: {
    backgroundImage: `repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 23px,
      rgba(59, 130, 246, 0.25) 23px,
      rgba(59, 130, 246, 0.25) 24px,
      transparent 24px,
      transparent 47px,
      rgba(220, 38, 38, 0.2) 47px,
      rgba(220, 38, 38, 0.2) 48px
    )`,
  },
  GRID: {
    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  },
  DOTS: {
    backgroundImage: `radial-gradient(
      circle,
      rgba(0, 0, 0, 0.25) 1px,
      transparent 1px
    )`,
    backgroundSize: '20px 20px',
  },
};

export function getThoughtPatternStyle(pattern: ThoughtPattern | undefined): React.CSSProperties {
  if (!pattern || pattern === 'PLAIN') {
    return {};
  }

  return PATTERN_STYLES[pattern];
}
