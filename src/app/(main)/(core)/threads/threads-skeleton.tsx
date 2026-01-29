import { Skeleton } from "@mantine/core";

import { THREADS_PER_PAGE } from "@/config/thread";
import classes from "./threads.module.css";

export function ThreadsSkeleton() {
  return (
    <div className={classes["thread-skeletons"]}>
      {Array.from({ length: THREADS_PER_PAGE }, (_, i) => (
        <Skeleton
          key={i}
          visible={true}
          className={classes["thread-skeleton"]}
        />
      ))}
    </div>
  );
}
