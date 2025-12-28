import { Flex, Skeleton } from "@mantine/core";

import { THREAD_POSTS_PER_PAGE } from "@/config/thread";

export function ThreadsSkeleton() {
  return (
    <Flex direction="column" gap="md">
      {Array.from({ length: THREAD_POSTS_PER_PAGE }, (_, i) => (
        <Skeleton key={i} height={200} visible={true} />
      ))}
    </Flex>
  );
}
