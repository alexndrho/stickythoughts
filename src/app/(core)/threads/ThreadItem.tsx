import {
  Anchor,
  Avatar,
  Box,
  Flex,
  Group,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { formatDistance } from "date-fns";

import { stripHtmlTags } from "@/utils/text";
import LikeButton from "@/app/(core)/threads/LikeButton";
import CommentButton from "@/app/(core)/threads/CommentButton";
import ShareButton from "@/app/(core)/threads/ShareButton";
import type { ThreadType } from "@/types/thread";
import classes from "./threads.module.css";

export interface ThreadItemProps {
  post: ThreadType;
  onLike?: ({ id, like }: { id: string; like: boolean }) => void;
}

export default function ThreadItem({ post, onLike }: ThreadItemProps) {
  return (
    <Paper
      component="article"
      shadow="xs"
      pos="relative"
      withBorder
      className={classes.thread}
    >
      <Box p="md">
        <Link
          href={`/threads/${post.id}`}
          className={classes["thread__main-link"]}
          aria-label={`View thread titled ${post.title}`}
        />

        <Flex direction="column">
          <header>
            <Flex align="center" gap="xs">
              <Avatar
                component={Link}
                pos="relative"
                size="xs"
                src={post.author.image}
                href={`/user/${post.author.username}`}
                aria-label={`View profile of ${post.author.username}`}
              />

              <Text size="sm">
                <Anchor
                  component={Link}
                  pos="relative"
                  href={`/user/${post.author.username}`}
                  className={classes.thread__link}
                >
                  {post.author.name || post.author.username}
                </Anchor>{" "}
                •{" "}
                {formatDistance(new Date(post.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </Text>
            </Flex>
            <Title order={2} size="h3" lineClamp={2}>
              {post.title}
            </Title>
          </header>

          <Text lineClamp={5}>{stripHtmlTags(post.body)}</Text>
        </Flex>

        <Group mt="md">
          <LikeButton
            pos="relative"
            liked={post.likes.liked}
            count={post.likes.count}
            size="compact-sm"
            onLike={(e) => {
              e.preventDefault();

              onLike?.({
                id: post.id,
                like: !post.likes.liked,
              });
            }}
          />

          <CommentButton
            pos="relative"
            component={Link}
            href={`/threads/${post.id}`}
            count={post.comments.count}
            size="compact-sm"
          />

          <ShareButton
            pos="relative"
            size="compact-sm"
            link={`${process.env.NEXT_PUBLIC_BASE_URL}/threads/${post.id}`}
          />
        </Group>
      </Box>
    </Paper>
  );
}
