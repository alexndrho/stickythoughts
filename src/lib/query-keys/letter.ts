export const letterKeys = {
  all: () => ["letter"] as const,
  byId: (id: string) => [...letterKeys.all(), id] as const,
  infiniteList: () => [...letterKeys.all(), "infiniteLetter"] as const,
  infiniteReplies: (letterId: string) =>
    [...letterKeys.byId(letterId), "infiniteReplies"] as const,
};

