import "server-only";

export { getHighlightedThought } from "./thought-highlight-service";
export type { HighlightedThought } from "./thought-highlight-service";

export {
  countDeletedThoughts,
  countPublicThoughts,
  createThought,
  getDeletedThoughtStatus,
  listAdminThoughts,
  listDeletedThoughts,
  listPublicThoughts,
  purgeThought,
  restoreThought,
  softDeleteThought,
} from "./thoughts-service";

export {
  findCurrentHighlight,
  getThoughtHighlightStatus,
  updateHighlight,
} from "./thought-highlight-service";
