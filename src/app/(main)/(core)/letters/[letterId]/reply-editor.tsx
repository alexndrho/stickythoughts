'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Group, Switch, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';

import { submitLetterReply } from '@/services/letter';
import { createLetterReplyServerInput } from '@/lib/validations/letter';
import ServerError from '@/utils/error/ServerError';
import { setCreateLetterReplyQueryData } from '@/app/(main)/(core)/letters/set-query-data';

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
