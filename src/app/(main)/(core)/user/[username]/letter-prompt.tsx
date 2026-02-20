import Link from 'next/link';
import { Button, Title } from '@mantine/core';
import { IconNote, IconPlus } from '@tabler/icons-react';

import classes from './user.module.css';

export interface LetterPromptProps {
  isOwnProfile: boolean;
}

export default function LetterPrompt({ isOwnProfile }: LetterPromptProps) {
  return (
    <div className={classes['tab-prompt']}>
      <IconNote size="3rem" className={classes['tab-prompt__icon']} />

      {isOwnProfile ? <OwnProfileContent /> : <OtherProfileContent />}
    </div>
  );
}

function OwnProfileContent() {
  return (
    <>
      <Title order={2} size="h3" className={classes['tab-prompt__title']}>
        You haven&apos;t created any letters yet, create your first letter to get started.
      </Title>

      <Button
        component={Link}
        href="/letters/submit"
        leftSection={<IconPlus size="1em" />}
        className={classes['tab-prompt__create-button']}
      >
        Create Letter
      </Button>
    </>
  );
}

function OtherProfileContent() {
  return (
    <Title order={2} size="h3" className={classes['tab-prompt__title']}>
      This user hasn&apos;t created any letters yet.
    </Title>
  );
}
