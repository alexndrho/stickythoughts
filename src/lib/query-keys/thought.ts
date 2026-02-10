export const thoughtKeys = {
  all: () => ["thoughts"] as const,
  count: () => [...thoughtKeys.all(), "count"] as const,
  infinite: () => [...thoughtKeys.all(), "infiniteThoughts"] as const,
  infiniteSearch: (search: string) =>
    [...thoughtKeys.infinite(), "infiniteSearch", search] as const,
};

