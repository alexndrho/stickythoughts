import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Anchor, Divider, Group, Paper, Text } from '@mantine/core';

import AuthorAvatar from '@/components/author-avatar';
import LikeButton from '@/app/(main)/(core)/letters/like-button';
import ReplyButton from '@/app/(main)/(core)/letters/reply-button';
import ShareButton from '@/app/(main)/(core)/letters/share-button';
import type { Letter } from '@/types/letter';
import { getLetterFromDisplay } from '@/utils/letter-display';
import classes from '@/styles/components/letter-item.module.css';

export interface LetterItemProps {
  post: Letter;
  likeLoading?: boolean;
  onLike?: ({
    id,
    like,
    authorUsername,
  }: {
    id: string;
    like: boolean;
    authorUsername: string;
  }) => void;
}

export default function LetterItem({ post, likeLoading, onLike }: LetterItemProps) {
  const authorName = post.author?.name || null;
  const authorUsername = post.author?.username || null;
  const { displayName: fromDisplayName, isAnonymous } = getLetterFromDisplay({
    anonymousFrom: post.anonymousFrom,
    authorName,
    authorUsername,
  });
  const createdAtLabel = formatDistanceToNow(post.postedAt ?? post.createdAt, {
    addSuffix: true,
  });

  return (
    <Paper component="article" withBorder className={classes['letter-item']}>
      <Link
        href={`/letters/${post.id}`}
        aria-label={`View letter from ${fromDisplayName} to ${post.recipient}`}
        className={classes['letter-item__main-link']}
      />

      <div className={classes['letter-item__content']}>
        <header>
          <div>
            <div className={classes['letter-item__participant-row']}>
              <Text className={classes['letter-item__participant-label']}>From:</Text>

              <Group className={classes['letter-item__participant-value-group']}>
                {!isAnonymous && post.author && (
                  <AuthorAvatar
                    component={Link}
                    size="xs"
                    src={post.author.image}
                    aria-label={`View profile of ${post.author.username}`}
                    href={`/user/${post.author.username}`}
                    className={classes['letter-item__avatar']}
                  />
                )}

                {!isAnonymous && post.author ? (
                  <Anchor
                    component={Link}
                    inherit
                    href={`/user/${post.author.username}`}
                    className={`${classes['letter-item__user-link']} ${classes['letter-item__participant-value']}`}
                    title={fromDisplayName}
                  >
                    {fromDisplayName}
                  </Anchor>
                ) : (
                  <Text
                    size="md"
                    fw={500}
                    className={classes['letter-item__participant-value']}
                    title={fromDisplayName}
                  >
                    {fromDisplayName}
                  </Text>
                )}
              </Group>
            </div>

            <div className={classes['letter-item__participant-row']}>
              <Text className={classes['letter-item__participant-label']}>To:</Text>

              <Text
                size="md"
                fw={500}
                className={classes['letter-item__participant-value']}
                title={post.recipient}
              >
                {post.recipient}
              </Text>
            </div>

            <div className={classes['letter-item__participant-row']}>
              <Text className={classes['letter-item__participant-label']}>Date:</Text>

              <Text size="md" fw={500} className={classes['letter-item__participant-value']}>
                {createdAtLabel}
                {post.bodyUpdatedAt && <span> (edited)</span>}
              </Text>
            </div>
          </div>
        </header>

        <Divider className={classes['letter-item__divider']} />

        <Text lineClamp={5}>{post.body}</Text>

        <Group className={classes['letter-item__group-actions']}>
          <LikeButton
            liked={post.likes.liked}
            count={post.likes.count}
            size="compact-sm"
            className={classes['letter-item__action']}
            loading={likeLoading}
            onLike={(e) => {
              e.preventDefault();

              onLike?.({
                id: post.id,
                like: !post.likes.liked,
                authorUsername: post.author?.username || '',
              });
            }}
          />

          <ReplyButton
            component={Link}
            href={`/letters/${post.id}`}
            count={post.replies.count}
            size="compact-sm"
            className={classes['letter-item__action']}
          />

          <ShareButton
            size="compact-sm"
            link={`${process.env.NEXT_PUBLIC_BASE_URL}/letters/${post.id}`}
            className={classes['letter-item__action']}
          />
        </Group>
      </div>
    </Paper>
  );
}
