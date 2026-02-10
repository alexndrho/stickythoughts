export const adminKeys = {
  all: () => ["admin"] as const,

  thoughts: () => [...adminKeys.all(), "thoughts"] as const,
  thoughtsPage: (page: number) => [...adminKeys.thoughts(), page] as const,

  deleted: () => [...adminKeys.all(), "deleted"] as const,
  deletedThoughts: () => [...adminKeys.deleted(), "thoughts"] as const,
  deletedLetters: () => [...adminKeys.deleted(), "letters"] as const,
  deletedReplies: () => [...adminKeys.deleted(), "replies"] as const,
  deletedThoughtsPage: (page: number) =>
    [...adminKeys.deletedThoughts(), page] as const,
  deletedLettersPage: (page: number) =>
    [...adminKeys.deletedLetters(), page] as const,
  deletedRepliesPage: (page: number) =>
    [...adminKeys.deletedReplies(), page] as const,
  deletedThoughtsCount: () =>
    [...adminKeys.deletedThoughts(), "count"] as const,
  deletedLettersCount: () =>
    [...adminKeys.deletedLetters(), "count"] as const,
  deletedRepliesCount: () =>
    [...adminKeys.deletedReplies(), "count"] as const,

  users: () => [...adminKeys.all(), "users"] as const,
  usersPage: (input: {
    page: number;
    search?: string;
    sortDirection?: "asc" | "desc";
  }) =>
    [
      ...adminKeys.users(),
      input.page,
      input.search,
      input.sortDirection,
    ] as const,
};

