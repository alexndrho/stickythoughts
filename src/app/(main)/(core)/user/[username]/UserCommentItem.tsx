import Link from "next/link";
import { formatDistance } from "date-fns";
import { Anchor, Box, Group, Paper, Text, Typography } from "@mantine/core";

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
      pos="relative"
      shadow="xs"
      withBorder
      className={classes.comment}
    >
      <Link
        href={`/threads/${comment.threadId}`}
        className={classes["comment__main-link"]}
        aria-label={`View thread titled ${comment.thread.title}`}
      />

      <Box p="md">
        <Text>
          Replied to{" "}
          <Anchor
            component={Link}
            pos="relative"
            fw="bold"
            href={`/threads/${comment.threadId}`}
            className={classes.comment__link}
          >
            {comment.thread.title}
          </Anchor>
        </Text>

        <Text mb="md" fz="sm" truncate>
          <Anchor
            component={Link}
            pos="relative"
            fw="bold"
            href={`/user/${comment.author.username}`}
            className={classes.comment__link}
          >
            {comment.author.name || comment.author.username}
          </Anchor>{" "}
          commented{" "}
          {formatDistance(new Date(comment.createdAt), new Date(), {
            addSuffix: true,
          })}
        </Text>

        <Typography>
          <div dangerouslySetInnerHTML={{ __html: comment.body }} />
        </Typography>

        <Group pos="relative" mt="md" justify="md">
          <LikeButton
            size="compact-sm"
            count={comment.likes.count}
            liked={comment.likes.liked}
            onLike={() => {
              onLike({
                threadId: comment.threadId,
                commentId: comment.id,
                username: comment.author.username,
                like: !comment.likes.liked,
              });
            }}
          />
        </Group>
      </Box>
    </Paper>
  );
}
