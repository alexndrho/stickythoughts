import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Anchor, Paper, Text, Typography } from "@mantine/core";

import LikeButton from "../../letters/like-button";
import { type UserLetterReplyType } from "@/types/letter";
import classes from "./user.module.css";
import AuthorAvatar from "@/components/author-avatar";

export interface UserReplyItemProps {
  reply: UserLetterReplyType;
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

export default function UserReplyItem({
  reply,
  onLike,
}: UserReplyItemProps) {
  return (
    <Paper
      component="article"
      withBorder
      className={classes["user-reply-item"]}
    >
      <Link
        href={`/letters/${reply.letterId}`}
        className={classes["user-reply-item__main-link"]}
        aria-label={`View letter titled ${reply.letter.title}`}
      />

      <div className={classes["user-reply-item__content"]}>
        <Text>
          Replied to{" "}
          <Anchor
            component={Link}
            inherit
            href={`/letters/${reply.letterId}`}
            className={classes["user-reply-item__link"]}
          >
            {reply.letter.title}
          </Anchor>
        </Text>

        <div className={classes["user-reply-item__header"]}>
          {reply.isAnonymous || !reply.author ? (
            <AuthorAvatar
              size="xs"
              isAnonymous={!!reply.isAnonymous}
              className={classes["user-reply-item__anonymous-avatar"]}
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
                className={classes["user-reply-item__link"]}
              >
                {reply.author.name || reply.author.username}
              </Anchor>
            )}{" "}
            replied{" "}
            {formatDistanceToNow(new Date(reply.createdAt), {
              addSuffix: true,
            })}
          </Text>
        </div>

        <Typography>
          <div dangerouslySetInnerHTML={{ __html: reply.body }} />
        </Typography>

        <LikeButton
          size="compact-sm"
          count={reply.likes.count}
          liked={reply.likes.liked}
          className={classes["user-reply-item__like-btn"]}
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
