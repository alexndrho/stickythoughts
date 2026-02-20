import { Title } from '@mantine/core';

import classes from './user.module.css';
import { IconHeartBroken, IconLock } from '@tabler/icons-react';

export interface LikesPromptProps {
  isOwnProfile: boolean;
  isPrivate: boolean;
}

export default function LikesPrompt({ isOwnProfile, isPrivate }: LikesPromptProps) {
  return (
    <div className={classes['tab-prompt']}>
      {!isPrivate || isOwnProfile ? (
        <PublicLikesContent isOwnProfile={isOwnProfile} />
      ) : (
        <PrivateLikesContent />
      )}
    </div>
  );
}

function PrivateLikesContent() {
  return (
    <>
      <IconLock size="3rem" className={classes['tab-prompt__icon']} />

      <Title order={2} size="h3" className={classes['tab-prompt__title']}>
        This user&apos;s liked letters are private.
      </Title>
    </>
  );
}

function PublicLikesContent({ isOwnProfile }: { isOwnProfile: boolean }) {
  return (
    <>
      <IconHeartBroken size="3rem" className={classes['tab-prompt__icon']} />

      {isOwnProfile ? (
        <Title order={2} size="h3" className={classes['tab-prompt__title']}>
          You haven&apos;t liked any letters yet.
        </Title>
      ) : (
        <Title order={2} size="h3" className={classes['tab-prompt__title']}>
          This user hasn&apos;t liked any letters yet.
        </Title>
      )}
    </>
  );
}
