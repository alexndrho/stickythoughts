import { Anchor, Group, Paper, Text, Title } from "@mantine/core";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { stripHtmlTags } from "@/utils/text";
import AuthorAvatar from "@/components/author-avatar";
import LikeButton from "@/app/(main)/(core)/threads/like-button";
import CommentButton from "@/app/(main)/(core)/threads/comment-button";
import ShareButton from "@/app/(main)/(core)/threads/share-button";
import type { ThreadType } from "@/types/thread";
import classes from "./threads.module.css";

export interface ThreadItemProps {
  post: ThreadType;
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

export default function ThreadItem({ post, onLike }: ThreadItemProps) {
  return (
    <Paper component="article" withBorder className={classes["thread-item"]}>
      <Link
        href={`/threads/${post.id}`}
        aria-label={`View thread titled ${post.title}`}
        className={classes["thread-item__main-link"]}
      />

      <div className={classes["thread-item__content"]}>
        <header>
          <div className={classes["thread-item__header"]}>
            {post.isAnonymous || !post.author ? (
              <AuthorAvatar size="xs" isAnonymous={!!post.isAnonymous} />
            ) : (
              <AuthorAvatar
                component={Link}
                size="xs"
                src={post.author.image}
                aria-label={`View profile of ${post.author.username}`}
                href={`/user/${post.author.username}`}
                className={classes["thread-item__avatar"]}
              />
            )}

            <Text size="sm">
              {post.isAnonymous || !post.author ? (
                "Anonymous"
              ) : (
                <Anchor
                  component={Link}
                  inherit
                  href={`/user/${post.author.username}`}
                  className={classes["thread-item__user-link"]}
                >
                  {post.author.name || post.author.username}
                </Anchor>
              )}{" "}
              •{" "}
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </Text>
          </div>

          <Title order={2} size="h3" lineClamp={2}>
            {post.title}
          </Title>
        </header>

        <Text lineClamp={5}>{stripHtmlTags(post.body)}</Text>

        <Group className={classes["thread-item__group-actions"]}>
          <LikeButton
            liked={post.likes.liked}
            count={post.likes.count}
            size="compact-sm"
            className={classes["thread-item__action"]}
            onLike={(e) => {
              e.preventDefault();

              onLike?.({
                id: post.id,
                like: !post.likes.liked,
                authorUsername: post.author?.username || "",
              });
            }}
          />

          <CommentButton
            component={Link}
            href={`/threads/${post.id}`}
            count={post.comments.count}
            size="compact-sm"
            className={classes["thread-item__action"]}
          />

          <ShareButton
            size="compact-sm"
            link={`${process.env.NEXT_PUBLIC_BASE_URL}/threads/${post.id}`}
            className={classes["thread-item__action"]}
          />
        </Group>
      </div>
    </Paper>
  );
}
