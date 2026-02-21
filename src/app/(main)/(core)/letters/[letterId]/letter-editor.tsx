'use client';

import { Button, Flex, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import { updateLetter } from '@/services/letter';
import { getQueryClient } from '@/lib/get-query-client';
import ServerError from '@/utils/error/ServerError';
import { updateLetterServerInput } from '@/lib/validations/letter';
import { letterKeys } from '@/lib/query-keys/letter';
import type { Letter } from '@/types/letter';
import { LETTER_BODY_MAX_LENGTH, LETTER_BODY_WARNING_THRESHOLD } from '@/config/letter';
import classes from './letter.module.css';

export interface ForumEditorProps {
  id: string;
  body: string;
  onClose: () => void;
}

export default function ForumEditor({ id, body, onClose }: ForumEditorProps) {
  const updateForm = useForm({
    initialValues: {
      body,
    },
    validate: zod4Resolver(updateLetterServerInput),
  });

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
      <Textarea
        autosize
        minRows={6}
        maxRows={18}
        placeholder="Edit your post..."
        maxLength={LETTER_BODY_MAX_LENGTH}
        rightSection={
          LETTER_BODY_MAX_LENGTH - updateForm.values.body.length <=
            LETTER_BODY_WARNING_THRESHOLD && (
            <Text size="sm" className={classes['length-indicator']}>
              {LETTER_BODY_MAX_LENGTH - updateForm.values.body.length}
            </Text>
          )
        }
        {...updateForm.getInputProps('body')}
      />

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
