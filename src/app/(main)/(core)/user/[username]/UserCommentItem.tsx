import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Anchor, Paper, Text, Typography } from "@mantine/core";

import LikeButton from "../../threads/LikeButton";
import { type UserThreadCommentType } from "@/types/thread";
import classes from "./user.module.css";

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

        <Text
          size="sm"
          truncate
          className={classes["user-comment-item__description"]}
        >
          <Anchor
            component={Link}
            inherit
            href={`/user/${comment.author.username}`}
            className={classes["user-comment-item__link"]}
          >
            {comment.author.name || comment.author.username}
          </Anchor>{" "}
          commented{" "}
          {formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
          })}
        </Text>

        <Typography>
          <div dangerouslySetInnerHTML={{ __html: comment.body }} />
        </Typography>

        <LikeButton
          size="compact-sm"
          count={comment.likes.count}
          liked={comment.likes.liked}
          className={classes["user-comment-item__like-btn"]}
          onLike={() => {
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
