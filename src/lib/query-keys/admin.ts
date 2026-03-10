export const adminKeys = {
  all: () => ['admin'] as const,

  thoughts: () => [...adminKeys.all(), 'thoughts'] as const,
  highlightedThought: () => [...adminKeys.thoughts(), 'highlighted'] as const,
  thoughtsPage: (page: number) => [...adminKeys.thoughts(), page] as const,

  thoughtSubmissions: () => [...adminKeys.submissions(), 'thoughts'] as const,
  submittedThoughts: () => [...adminKeys.thoughtSubmissions(), 'submitted'] as const,
  flaggedThoughts: () => [...adminKeys.thoughtSubmissions(), 'flagged'] as const,
  rejectedThoughts: () => [...adminKeys.thoughtSubmissions(), 'rejected'] as const,
  submittedThoughtsPage: (page: number) => [...adminKeys.submittedThoughts(), page] as const,
  flaggedThoughtsPage: (page: number) => [...adminKeys.flaggedThoughts(), page] as const,
  rejectedThoughtsPage: (page: number) => [...adminKeys.rejectedThoughts(), page] as const,
  submittedThoughtsCount: () => [...adminKeys.submittedThoughts(), 'count'] as const,
  flaggedThoughtsCount: () => [...adminKeys.flaggedThoughts(), 'count'] as const,
  rejectedThoughtsCount: () => [...adminKeys.rejectedThoughts(), 'count'] as const,

  submissions: () => [...adminKeys.all(), 'submissions'] as const,
  submittedLetters: () => [...adminKeys.submissions(), 'submitted'] as const,
  flaggedLetters: () => [...adminKeys.submissions(), 'flagged'] as const,
  rejectedLetters: () => [...adminKeys.submissions(), 'rejected'] as const,
  submittedLettersPage: (page: number) => [...adminKeys.submittedLetters(), page] as const,
  flaggedLettersPage: (page: number) => [...adminKeys.flaggedLetters(), page] as const,
  rejectedLettersPage: (page: number) => [...adminKeys.rejectedLetters(), page] as const,
  submittedLettersCount: () => [...adminKeys.submittedLetters(), 'count'] as const,
  flaggedLettersCount: () => [...adminKeys.flaggedLetters(), 'count'] as const,
  rejectedLettersCount: () => [...adminKeys.rejectedLetters(), 'count'] as const,

  users: () => [...adminKeys.all(), 'users'] as const,
  usersPage: (input: { page: number; search?: string; sortDirection?: 'asc' | 'desc' }) =>
    [...adminKeys.users(), input.page, input.search, input.sortDirection] as const,

  deleted: () => [...adminKeys.all(), 'deleted'] as const,
  deletedThoughts: () => [...adminKeys.deleted(), 'thoughts'] as const,
  deletedLetters: () => [...adminKeys.deleted(), 'letters'] as const,
  deletedReplies: () => [...adminKeys.deleted(), 'replies'] as const,
  deletedThoughtsPage: (page: number) => [...adminKeys.deletedThoughts(), page] as const,
  deletedLettersPage: (page: number) => [...adminKeys.deletedLetters(), page] as const,
  deletedRepliesPage: (page: number) => [...adminKeys.deletedReplies(), page] as const,
  deletedThoughtsCount: () => [...adminKeys.deletedThoughts(), 'count'] as const,
  deletedLettersCount: () => [...adminKeys.deletedLetters(), 'count'] as const,
  deletedRepliesCount: () => [...adminKeys.deletedReplies(), 'count'] as const,
};
