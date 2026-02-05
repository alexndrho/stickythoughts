import { Skeleton } from "@mantine/core";

import { LETTERS_PER_PAGE } from "@/config/letter";
import classes from "./letters.module.css";

export function LettersSkeleton() {
  return (
    <div className={classes["letter-skeletons"]}>
      {Array.from({ length: LETTERS_PER_PAGE }, (_, i) => (
        <Skeleton
          key={i}
          visible={true}
          className={classes["letter-skeleton"]}
        />
      ))}
    </div>
  );
}
