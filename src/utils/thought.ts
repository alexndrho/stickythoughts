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

// All em-based so patterns adapt to actual rendered font size on any device.
// Mantine default line-height: 1.55, card padding: 0.75em (thought.module.css)
const LH = 1.55;
const PAD = 0.75;
const HALF_LEAD = (LH - 1) / 2;
const OFFSET_Y = PAD - HALF_LEAD; // base Y offset adjusted for half-leading
const BASE_STYLE: React.CSSProperties = { lineHeight: LH };

// Use the CSS `lh` unit for repeating background sizes so the pattern interval is
// always identical to the computed line-height.  `em`-based sizes can drift on
// Safari mobile due to sub-pixel rounding differences between background-size and
// line-height, causing lines to gradually fall out of sync with the text.
const PATTERN_STYLES: Record<Exclude<ThoughtPattern, 'PLAIN'>, React.CSSProperties> = {
  LINED: {
    ...BASE_STYLE,
    // Two layers: blue first, red second
    backgroundImage: [
      `linear-gradient(to bottom, rgba(30, 70, 180, 0.3) 1px, transparent 1px)`,
      `linear-gradient(to bottom, rgba(180, 30, 30, 0.25) 1px, transparent 1px)`,
    ].join(','),
    backgroundSize: `100% 2lh`,
    backgroundPosition: [
      `0 calc(${OFFSET_Y}em + 1lh - 1px)`,
      `0 calc(${OFFSET_Y}em + 2lh - 1px)`,
    ].join(','),
  },
  GRID: {
    ...BASE_STYLE,
    // Vertical lines centered horizontally, horizontal lines aligned to text
    backgroundImage: [
      `linear-gradient(to right, rgba(0, 0, 0, 0.2) 1px, transparent 1px)`,
      `linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 1px, transparent 1px)`,
    ].join(','),
    backgroundSize: `1lh 1lh`,
    backgroundPosition: [`center ${OFFSET_Y}em`, `center calc(${OFFSET_Y}em + 1lh - 1px)`].join(
      ',',
    ),
  },
  DOTS: {
    ...BASE_STYLE,
    backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.3) 1px, transparent 1px)`,
    backgroundSize: `1lh 1lh`,
    backgroundPosition: `center calc(${OFFSET_Y}em + 0.5lh - 1px)`,
  },
};

export function getThoughtPatternStyle(pattern: ThoughtPattern | undefined): React.CSSProperties {
  if (!pattern || pattern === 'PLAIN') {
    return {};
  }

  return PATTERN_STYLES[pattern];
}
