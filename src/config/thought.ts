const THOUGHTS_PER_ROW = 4;
const ROWS_PER_PAGE = 6;
export const THOUGHTS_PER_PAGE = THOUGHTS_PER_ROW * ROWS_PER_PAGE;

export const THOUGHT_MIN_AUTHOR_LENGTH = 2;
export const THOUGHT_MIN_MESSAGE_LENGTH = 5;
export const THOUGHT_MAX_AUTHOR_LENGTH = 20;
export const THOUGHT_MAX_MESSAGE_LENGTH = 250;

export const THOUGHT_COLORS = [
  "yellow",
  "blue",
  "red",
  "violet",
  "green",
  "pink",
] as const;
