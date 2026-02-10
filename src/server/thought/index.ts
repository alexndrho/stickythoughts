import "server-only";

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
