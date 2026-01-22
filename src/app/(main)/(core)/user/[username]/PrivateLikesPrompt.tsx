import { Text } from "@mantine/core";

import classes from "./user.module.css";

export default function PrivateLikesPrompt() {
  return (
    <div className={classes["tab-prompt"]}>
      <Text className={classes["tab-prompt__description"]}>
        This user&apos;s liked threads are private.
      </Text>
    </div>
  );
}
