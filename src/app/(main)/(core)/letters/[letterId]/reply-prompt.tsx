import { Title } from '@mantine/core';
import { IconNote } from '@tabler/icons-react';

import classes from './letter.module.css';

export default function ReplyPrompt() {
  return (
    <div className={classes['replies-prompt']}>
      <IconNote size="3rem" className={classes['replies-prompt__icon']} />

      <Title order={2} size="h3" className={classes['replies-prompt__title']}>
        Be the first to reply to this letter
      </Title>
    </div>
  );
}
