import Link from "next/link";
import { Button, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import classes from "./user.module.css";

export interface EmptyThreadPromptProps {
  isCurrentUser: boolean;
}

export default function EmptyThreadPrompt({
  isCurrentUser,
}: EmptyThreadPromptProps) {
  if (isCurrentUser) {
    return (
      <div className={classes["tab-prompt"]}>
        <Text className={classes["tab-prompt__description"]}>
          You haven&apos;t created any threads yet. Create your first thread to
          get started!
        </Text>

        <Button
          component={Link}
          href="/threads/submit"
          leftSection={<IconPlus size="1em" />}
          className={classes["tab-prompt__create-button"]}
        >
          Create Thread
        </Button>
      </div>
    );
  }

  return (
    <Text className={classes["tab-prompt__description"]}>
      This user hasn&apos;t created any threads yet.
    </Text>
  );
}
