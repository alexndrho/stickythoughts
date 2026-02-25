import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Anchor, Paper, Text } from '@mantine/core';
import MultilineText from '@/components/multiline-text';

import LikeButton from '../../letters/like-button';
import { type UserLetterReply } from '@/types/letter';
import classes from './user.module.css';
import AuthorAvatar from '@/components/author-avatar';
import { formatUserDisplayName } from '@/utils/user';

export interface UserReplyItemProps {
  reply: UserLetterReply;
  onLike: ({
    letterId,
    replyId,
    username,
    like,
  }: {
    letterId: string;
    replyId: string;
    username: string;
    like: boolean;
  }) => void;
}

export default function UserReplyItem({ reply, onLike }: UserReplyItemProps) {
  const isReplyToOwnLetter =
    !!reply.author &&
    !!reply.letter.author &&
    reply.author.username === reply.letter.author.username;
  const repliedToLabel = isReplyToOwnLetter
    ? 'own letter'
    : reply.letter.author
      ? formatUserDisplayName(reply.letter.author)
      : 'Anonymous';

  return (
    <Paper component="article" withBorder className={classes['user-reply-item']}>
      <Link
        href={`/letters/${reply.letterId}`}
        className={classes['user-reply-item__main-link']}
        aria-label={`View letter for ${reply.letter.recipient}`}
      />

      <div className={classes['user-reply-item__content']}>
        <Text>
          Replied to{' '}
          <Anchor
            component={Link}
            inherit
            href={`/letters/${reply.letterId}`}
            className={classes['user-reply-item__link']}
          >
            {repliedToLabel}
          </Anchor>
        </Text>

        <header className={classes['user-reply-item__header']}>
          {reply.isAnonymous || !reply.author ? (
            <AuthorAvatar
              size="xs"
              isAnonymous={!!reply.isAnonymous}
              className={classes['user-reply-item__anonymous-avatar']}
            />
          ) : (
            <AuthorAvatar
              size="xs"
              component={Link}
              href={`/user/${reply.author.username}`}
              aria-label={`View profile of ${reply.author.username}`}
              isAnonymous={!!reply.isAnonymous}
              src={reply.author?.image}
            />
          )}

          <Text size="sm" truncate>
            {reply.isAnonymous || !reply.author ? (
              <Text span inherit fw="bold">
                Anonymous
              </Text>
            ) : (
              <Anchor
                component={Link}
                inherit
                href={`/user/${reply.author.username}`}
                className={classes['user-reply-item__link']}
              >
                {reply.author.name || reply.author.username}
              </Anchor>
            )}{' '}
            replied{' '}
            {formatDistanceToNow(reply.createdAt, {
              addSuffix: true,
            })}
          </Text>
        </header>

        <MultilineText text={reply.body} />

        <LikeButton
          size="compact-sm"
          count={reply.likes.count}
          liked={reply.likes.liked}
          className={classes['user-reply-item__like-btn']}
          onLike={() => {
            if (!reply.author) return;

            onLike({
              letterId: reply.letterId,
              replyId: reply.id,
              username: reply.author.username,
              like: !reply.likes.liked,
            });
          }}
        />
      </div>
    </Paper>
  );
}
