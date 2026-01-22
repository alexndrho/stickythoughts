import { IconNote } from "@tabler/icons-react";

import classes from "./user.module.css";
import { Title } from "@mantine/core";

export interface CommentPromptProps {
  isOwnProfile: boolean;
}

export default function CommentPrompt({ isOwnProfile }: CommentPromptProps) {
  return (
    <div className={classes["tab-prompt"]}>
      <IconNote size="3rem" className={classes["tab-prompt__icon"]} />

      <Title order={2} size="h3" className={classes["tab-prompt__title"]}>
        {isOwnProfile ? <OwnProfileContent /> : <OtherProfileContent />}
      </Title>
    </div>
  );
}

function OwnProfileContent() {
  return (
    <>
      <Title order={2} size="h3" className={classes["tab-prompt__title"]}>
        You haven&apos;t created any comments yet.
      </Title>
    </>
  );
}

function OtherProfileContent() {
  return (
    <Title order={2} size="h3" className={classes["tab-prompt__title"]}>
      This user hasn&apos;t created any comments yet.
    </Title>
  );
}
