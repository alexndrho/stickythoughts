import { IconNote } from "@tabler/icons-react";

import classes from "./user.module.css";
import { Title } from "@mantine/core";

export interface CommentPromptProps {
  isOwnProfile: boolean;
}

export default function CommentPrompt({ isOwnProfile }: CommentPromptProps) {
  const title = isOwnProfile
    ? "You haven't created any comments yet."
    : "This user hasn't created any comments yet.";

  return (
    <div className={classes["tab-prompt"]}>
      <IconNote size="3rem" className={classes["tab-prompt__icon"]} />

      <Title order={2} size="h3" className={classes["tab-prompt__title"]}>
        {title}
      </Title>
    </div>
  );
}
