'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Group, Switch, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';

import { submitLetterReply } from '@/services/letter';
import { createLetterReplyServerInput } from '@/lib/validations/letter';
import ServerError from '@/utils/error/ServerError';
import { setCreateLetterReplyQueryData } from '@/app/(main)/(core)/letters/set-query-data';
import { LETTER_REPLY_MAX_LENGTH, LETTER_REPLY_WARNING_THRESHOLD } from '@/config/letter';
import classes from './letter.module.css';

export interface ReplyEditorProps {
  letterId: string;
  isDefaultAnonymous?: boolean;
}

export interface ReplySectionRef {
  focus: () => void;
}

const ReplyEditor = forwardRef<ReplySectionRef, ReplyEditorProps>(
  ({ letterId, isDefaultAnonymous }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const form = useForm({
      initialValues: {
        body: '',
        isAnonymous: isDefaultAnonymous ?? false,
      },
      validate: zod4Resolver(createLetterReplyServerInput),
    });

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    const replyMutation = useMutation({
      mutationFn: (values: typeof form.values) =>
        submitLetterReply({
          id: letterId,
          body: {
            body: values.body,
            isAnonymous: values.isAnonymous,
          },
        }),
      onSuccess: (data) => {
        setCreateLetterReplyQueryData({ id: letterId, reply: data });

        form.setValues({
          body: '',
          isAnonymous: form.values.isAnonymous,
        });

        notifications.show({
          title: 'Reply submitted',
          message: 'Your reply has been submitted successfully.',
        });
      },
      onError: (error) => {
        if (error instanceof ServerError) {
          form.setFieldError('body', error.issues[0].message);
        } else {
          form.setFieldError('body', 'Something went wrong');
        }
      },
    });

    return (
      <form onSubmit={form.onSubmit((values) => replyMutation.mutate(values))}>
        <Textarea
          ref={textareaRef}
          autosize
          minRows={4}
          maxRows={14}
          placeholder="What do you want to tell them?"
          maxLength={LETTER_REPLY_MAX_LENGTH}
          rightSection={
            LETTER_REPLY_MAX_LENGTH - form.values.body.length <= LETTER_REPLY_WARNING_THRESHOLD && (
              <Text size="sm" className={classes['length-indicator']}>
                {LETTER_REPLY_MAX_LENGTH - form.values.body.length}
              </Text>
            )
          }
          {...form.getInputProps('body')}
        />

        <Group mt="md" justify="space-between">
          <Switch
            label="Post anonymously"
            {...form.getInputProps('isAnonymous', { type: 'checkbox' })}
          />

          <Button type="submit" loading={replyMutation.isPending}>
            Reply
          </Button>
        </Group>
      </form>
    );
  },
);

ReplyEditor.displayName = 'ReplyEditor';
export default ReplyEditor;
