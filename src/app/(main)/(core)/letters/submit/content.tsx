'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import { Alert, Button, Container, Group, Switch, Text, TextInput, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import { authClient } from '@/lib/auth-client';
import { getQueryClient } from '@/lib/get-query-client';
import { letterKeys } from '@/lib/query-keys/letter';
import { searchKeys } from '@/lib/query-keys/search';
import { userKeys } from '@/lib/query-keys/user';
import { sanitizeString } from '@/utils/text';
import { submitLetter } from '@/services/letter';
import { useTiptapEditor } from '@/hooks/use-tiptap';
import TextEditor from '@/components/text-editor';
import ServerError from '@/utils/error/ServerError';
import { LETTER_BODY_MAX_LENGTH } from '@/lib/validations/letter';
import classes from './letter-submit.module.css';
import { notifications } from '@mantine/notifications';

export default function Content() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const requiresReview = !session || !session.user.emailVerified;

  const form = useForm({
    initialValues: {
      title: '',
      body: '<p></p>',
      isAnonymous: false,
    },
    validate: {
      title: (value) => {
        const formattedValue = sanitizeString(value);
        if (formattedValue.length < 1) return 'Title is required';
        if (formattedValue.length > 100) {
          return `Title must be at most 100 characters long`;
        }
      },
      body: () => {
        const textContent = editor?.isEmpty ? '' : sanitizeString(editor?.getText() || '');

        if (textContent.length < 1) {
          return 'Body is required';
        } else if (textContent.length > LETTER_BODY_MAX_LENGTH) {
          return `Body must be at most ${LETTER_BODY_MAX_LENGTH.toLocaleString()} characters long`;
        }
      },
    },
  });

  const editor = useTiptapEditor({
    content: '<p></p>',
    placeholder: 'Write your post...',
    onUpdate: ({ editor }) => {
      form.setFieldValue('body', editor.getHTML());
    },
    shouldRerenderOnTransaction: false,
  });

  const mutation = useMutation({
    mutationFn: submitLetter,
    onSuccess: ({ id }) => {
      if (!requiresReview) {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: letterKeys.infiniteList(),
        });

        if (session.user.username) {
          queryClient.invalidateQueries({
            queryKey: userKeys.infiniteLetters(session.user.username),
          });
        }

        queryClient.invalidateQueries({
          queryKey: searchKeys.all(),
        });

        router.push(`/letters/${id}`);
      } else {
        router.push('/letters');

        notifications.show({
          icon: <IconAlertCircle size="1em" />,
          title: 'Letter submitted',
          message:
            'Your letter has been submitted and is awaiting review. It will be published once approved.',
        });
      }
    },
    onError: (error) => {
      if (error instanceof ServerError) {
        error.issues.forEach((issue) => {
          if (issue.code === 'letter/title-already-exists') {
            form.setFieldError('title', issue.message);
          } else {
            form.setFieldError('root', issue.message);
          }
        });
      }
    },
  });

  return (
    <Container size="sm" className={classes.container}>
      <Title className={classes.title}>Write a letter</Title>

      {requiresReview && (
        <Alert mb="md" color="yellow" title="Review required" icon={<IconAlertCircle />}>
          Your letter will be reviewed before it is published.{' '}
          {session
            ? 'Verify your email to have future letters published without review.'
            : 'Sign in and verify your email to have future letters published without review.'}
        </Alert>
      )}

      <form onSubmit={form.onSubmit((value) => mutation.mutate(value))}>
        <TextInput
          label="Title"
          withAsterisk
          {...form.getInputProps('title')}
          className={classes['title-text-input']}
        />

        <TextEditor editor={editor} error={form.errors.body} />

        {form.errors.root && (
          <Text size="xs" className={classes['root-error-messsage']}>
            {form.errors.root}
          </Text>
        )}

        {session && (
          <Switch
            mt="md"
            label="Post anonymously"
            {...form.getInputProps('isAnonymous', { type: 'checkbox' })}
          />
        )}

        <Group mt="md" justify="end">
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!form.isDirty('title') || !form.isDirty('body')}
          >
            Post it!
          </Button>
        </Group>
      </form>
    </Container>
  );
}
