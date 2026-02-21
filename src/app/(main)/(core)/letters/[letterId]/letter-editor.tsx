'use client';

import { useEffect } from 'react';
import TextEditor from '@/components/text-editor';
import { useTiptapEditor } from '@/hooks/use-tiptap';
import { isNotEmptyHTML, useForm } from '@mantine/form';
import { Button, Flex, Text } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';

import { updateLetter } from '@/services/letter';
import { getQueryClient } from '@/lib/get-query-client';
import ServerError from '@/utils/error/ServerError';
import { letterKeys } from '@/lib/query-keys/letter';
import type { Letter } from '@/types/letter';
import classes from './letter.module.css';

export interface ForumEditorProps {
  id: string;
  body: string;
  onClose: () => void;
}

export default function ForumEditor({ id, body, onClose }: ForumEditorProps) {
  const editor = useTiptapEditor({
    content: body,
    placeholder: 'Edit your post...',
    onUpdate: ({ editor }) => {
      updateForm.setFieldValue('body', editor.getHTML());
    },
    shouldRerenderOnTransaction: false,
  });

  const updateForm = useForm({
    initialValues: {
      body,
    },
    validate: {
      body: isNotEmptyHTML('Body is required'),
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.focus('end');
    }
  }, [editor]);

  const updateMutation = useMutation({
    mutationFn: async ({ body }: { body: string }) =>
      updateLetter({
        id,
        body: { body },
      }),
    onSuccess: (data) => {
      onClose();

      updateForm.setInitialValues({
        body: data.body,
      });
      updateForm.reset();

      getQueryClient().setQueryData(letterKeys.byId(id), (oldData: Letter | undefined) =>
        oldData
          ? {
              ...oldData,
              ...data,
            }
          : oldData,
      );

      getQueryClient().invalidateQueries({
        queryKey: letterKeys.byId(id),
        refetchType: 'none',
      });

      getQueryClient().invalidateQueries({
        queryKey: letterKeys.infiniteList(),
      });
    },
    onError: (error) => {
      if (error instanceof ServerError) {
        updateForm.setFieldError('root', error.issues[0].message);
      } else {
        updateForm.setFieldError('root', 'Failed to update post');
      }
    },
  });

  return (
    <form onSubmit={updateForm.onSubmit((values) => updateMutation.mutate(values))}>
      <TextEditor editor={editor} error={updateForm.errors.body} />

      {updateForm.errors.root && (
        <Text size="xs" className={classes['letter-editor-root-error-messsage']}>
          {updateForm.errors.root}
        </Text>
      )}

      <Flex mt="md" justify="end" gap="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>

        <Button type="submit" loading={updateMutation.isPending} disabled={!updateForm.isDirty()}>
          Save
        </Button>
      </Flex>
    </form>
  );
}
