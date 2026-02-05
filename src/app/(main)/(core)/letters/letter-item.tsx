import { Anchor, Group, Paper, Text, Title } from "@mantine/core";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { stripHtmlTags } from "@/utils/text";
import AuthorAvatar from "@/components/author-avatar";
import LikeButton from "@/app/(main)/(core)/letters/like-button";
import ReplyButton from "@/app/(main)/(core)/letters/reply-button";
import ShareButton from "@/app/(main)/(core)/letters/share-button";
import type { LetterType } from "@/types/letter";
import classes from "./letters.module.css";

export interface LetterItemProps {
  post: LetterType;
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

export default function LetterItem({ post, onLike }: LetterItemProps) {
  return (
    <Paper component="article" withBorder className={classes["letter-item"]}>
      <Link
        href={`/letters/${post.id}`}
        aria-label={`View letter titled ${post.title}`}
        className={classes["letter-item__main-link"]}
      />

      <div className={classes["letter-item__content"]}>
        <header>
          <div className={classes["letter-item__header"]}>
            {post.isAnonymous || !post.author ? (
              <AuthorAvatar size="xs" isAnonymous={!!post.isAnonymous} />
            ) : (
              <AuthorAvatar
                component={Link}
                size="xs"
                src={post.author.image}
                aria-label={`View profile of ${post.author.username}`}
                href={`/user/${post.author.username}`}
                className={classes["letter-item__avatar"]}
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
                  className={classes["letter-item__user-link"]}
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

        <Group className={classes["letter-item__group-actions"]}>
          <LikeButton
            liked={post.likes.liked}
            count={post.likes.count}
            size="compact-sm"
            className={classes["letter-item__action"]}
            onLike={(e) => {
              e.preventDefault();

              onLike?.({
                id: post.id,
                like: !post.likes.liked,
                authorUsername: post.author?.username || "",
              });
            }}
          />

          <ReplyButton
            component={Link}
            href={`/letters/${post.id}`}
            count={post.replies.count}
            size="compact-sm"
            className={classes["letter-item__action"]}
          />

          <ShareButton
            size="compact-sm"
            link={`${process.env.NEXT_PUBLIC_BASE_URL}/letters/${post.id}`}
            className={classes["letter-item__action"]}
          />
        </Group>
      </div>
    </Paper>
  );
}
