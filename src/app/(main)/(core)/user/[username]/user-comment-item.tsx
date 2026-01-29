import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Anchor, Paper, Text, Typography } from "@mantine/core";

import LikeButton from "../../threads/like-button";
import { type UserThreadCommentType } from "@/types/thread";
import classes from "./user.module.css";
import AuthorAvatar from "@/components/author-avatar";

export interface UserCommentItemProps {
  comment: UserThreadCommentType;
  onLike: ({
    threadId,
    commentId,
    username,
    like,
  }: {
    threadId: string;
    commentId: string;
    username: string;
    like: boolean;
  }) => void;
}

export default function UserCommentItem({
  comment,
  onLike,
}: UserCommentItemProps) {
  return (
    <Paper
      component="article"
      withBorder
      className={classes["user-comment-item"]}
    >
      <Link
        href={`/threads/${comment.threadId}`}
        className={classes["user-comment-item__main-link"]}
        aria-label={`View thread titled ${comment.thread.title}`}
      />

      <div className={classes["user-comment-item__content"]}>
        <Text>
          Replied to{" "}
          <Anchor
            component={Link}
            inherit
            href={`/threads/${comment.threadId}`}
            className={classes["user-comment-item__link"]}
          >
            {comment.thread.title}
          </Anchor>
        </Text>

        <div className={classes["user-comment-item__header"]}>
          {comment.isAnonymous || !comment.author ? (
            <AuthorAvatar
              size="xs"
              isAnonymous={!!comment.isAnonymous}
              className={classes["user-comment-item__anonymous-avatar"]}
            />
          ) : (
            <AuthorAvatar
              size="xs"
              component={Link}
              href={`/user/${comment.author.username}`}
              aria-label={`View profile of ${comment.author.username}`}
              isAnonymous={!!comment.isAnonymous}
              src={comment.author?.image}
            />
          )}

          <Text size="sm" truncate>
            {comment.isAnonymous || !comment.author ? (
              <Text span inherit fw="bold">
                Anonymous
              </Text>
            ) : (
              <Anchor
                component={Link}
                inherit
                href={`/user/${comment.author.username}`}
                className={classes["user-comment-item__link"]}
              >
                {comment.author.name || comment.author.username}
              </Anchor>
            )}{" "}
            commented{" "}
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </Text>
        </div>

        <Typography>
          <div dangerouslySetInnerHTML={{ __html: comment.body }} />
        </Typography>

        <LikeButton
          size="compact-sm"
          count={comment.likes.count}
          liked={comment.likes.liked}
          className={classes["user-comment-item__like-btn"]}
          onLike={() => {
            if (!comment.author) return;

            onLike({
              threadId: comment.threadId,
              commentId: comment.id,
              username: comment.author.username,
              like: !comment.likes.liked,
            });
          }}
        />
      </div>
    </Paper>
  );
}
