'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { ActionIcon, Anchor, Avatar, Button, Group, Menu, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';

import { authClient } from '@/lib/auth-client';
import { setUpdateLetterReplyQueryData } from '@/app/(main)/(core)/letters/set-query-data';
import AuthorAvatar from '@/components/author-avatar';
import LikeButton from '@/app/(main)/(core)/letters/like-button';
import MultilineText from '@/components/multiline-text';
import { updateLetterReply } from '@/services/letter';
import ServerError from '@/utils/error/ServerError';
import { updateLetterReplyServerInput } from '@/lib/validations/letter';
import type { LetterReply } from '@/types/letter';
import { LETTER_REPLY_MAX_LENGTH, LETTER_REPLY_WARNING_THRESHOLD } from '@/config/letter';
import classes from './letter.module.css';

export interface ReplyItemProps {
  session: ReturnType<typeof authClient.useSession>['data'];
  reply: LetterReply;
  onLike: () => void;
  likeLoading?: boolean;
  onDelete: () => void;
}

export default function ReplyItem({
  session,
  reply,
  onLike,
  likeLoading,
  onDelete,
}: ReplyItemProps) {
  const [isEditable, setIsEditable] = useState(false);

  const isSelf = reply.isSelf;
  const anonymousName = reply.anonymousLabel ? `Anonymous ${reply.anonymousLabel}` : 'Anonymous';
  const hasPermission =
    session?.user?.role === 'admin' || session?.user?.role === 'moderator'
      ? authClient.admin.checkRolePermission({
          role: session.user.role,
          permission: {
            letterReply: ['delete'],
          },
        })
      : false;

  return (
    <article>
      <header className={classes['reply-item__header']}>
        {reply.isAnonymous || !reply.author ? (
          <AuthorAvatar isAnonymous={!!reply.isAnonymous} />
        ) : (
          <Avatar
            component={Link}
            src={reply.author.image}
            href={`/user/${reply.author.username}`}
            aria-label={`View profile of ${reply.author.username}`}
          />
        )}

        <div>
          <div className={classes['reply-item__author-container']}>
            {reply.isAnonymous || !reply.author ? (
              <Text className={classes['reply-item__author-name']}>
                {reply.isOP ? 'Anonymous' : anonymousName}
              </Text>
            ) : (
              <Anchor
                component={Link}
                truncate
                href={`/user/${reply.author.username}`}
                className={classes['reply-item__author-name']}
              >
                {reply.author.name || reply.author.username}
              </Anchor>
            )}

            {reply.isSelf && (
              <Text size="xs" className={classes['reply-item__author-self-badge']}>
                You
              </Text>
            )}

            {reply.isOP && (
              <Text size="xs" className={classes['reply-item__author-op-badge']}>
                OP
              </Text>
            )}
          </div>

          <Text size="xs" className={classes['reply-item__created-at']}>
            {formatDistanceToNow(reply.createdAt, {
              addSuffix: true,
            })}

            {reply.updatedAt.getTime() !== reply.createdAt.getTime() && <span> (edited)</span>}
          </Text>
        </div>

        {(isSelf || hasPermission) && (
          <Menu>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                aria-label="Reply more actions"
                className={classes['reply-item__more-action-btn']}
              >
                <IconDots size="1.25em" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {isSelf && (
                <Menu.Item
                  leftSection={<IconEdit size="1em" />}
                  onClick={() => setIsEditable(true)}
                >
                  Edit
                </Menu.Item>
              )}

              <Menu.Item color="red" leftSection={<IconTrash size="1em" />} onClick={onDelete}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </header>

      <div className={classes['reply-item__content']}>
        {isEditable ? (
          <Editor reply={reply} onClose={() => setIsEditable(false)} />
        ) : (
          <>
            <MultilineText text={reply.body} />

            <LikeButton
              liked={reply.likes.liked}
              count={reply.likes.count}
              size="compact-sm"
              className={classes['reply-item__like-btn']}
              loading={likeLoading}
              onLike={onLike}
            />
          </>
        )}
      </div>
    </article>
  );
}

function Editor({ reply, onClose }: { reply: LetterReply; onClose: () => void }) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const updateForm = useForm({
    initialValues: {
      body: reply.body,
    },
    validate: zod4Resolver(updateLetterReplyServerInput),
  });

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.focus();
    const valueLength = element.value.length;
    element.setSelectionRange(valueLength, valueLength);
  }, []);

  const updateMutation = useMutation({
    mutationFn: (values: typeof updateForm.values) =>
      updateLetterReply({
        letterId: reply.letterId,
        replyId: reply.id,
        body: {
          body: values.body,
        },
      }),
    onSuccess: (data) => {
      onClose();

      updateForm.setInitialValues({
        body: data.body,
      });
      updateForm.reset();

      setUpdateLetterReplyQueryData({
        letterId: reply.letterId,
        replyId: reply.id,
        reply: data,
      });
    },
    onError: (error) => {
      if (error instanceof ServerError) {
        updateForm.setFieldError('body', error.issues[0].message);
      } else {
        updateForm.setFieldError('body', 'Something went wrong');
      }
    },
  });

  return (
    <form onSubmit={updateForm.onSubmit((values) => updateMutation.mutate(values))}>
      <Textarea
        ref={textareaRef}
        autosize
        minRows={4}
        maxRows={12}
        placeholder="Write a reply..."
        maxLength={LETTER_REPLY_MAX_LENGTH}
        rightSection={
          LETTER_REPLY_MAX_LENGTH - updateForm.values.body.length <=
            LETTER_REPLY_WARNING_THRESHOLD && (
            <Text size="sm" className={classes['length-indicator']}>
              {LETTER_REPLY_MAX_LENGTH - updateForm.values.body.length}
            </Text>
          )
        }
        {...updateForm.getInputProps('body')}
      />

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>

        <Button type="submit" disabled={!updateForm.isDirty()} loading={updateMutation.isPending}>
          Save
        </Button>
      </Group>
    </form>
  );
}
