'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import {
  Alert,
  Button,
  Container,
  Group,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import { authClient } from '@/lib/auth-client';
import { createLetterServerInput } from '@/lib/validations/letter';
import { getQueryClient } from '@/lib/get-query-client';
import { letterKeys } from '@/lib/query-keys/letter';
import { searchKeys } from '@/lib/query-keys/search';
import { userKeys } from '@/lib/query-keys/user';
import { submitLetter } from '@/services/letter';
import ServerError from '@/utils/error/ServerError';
import classes from './letter-submit.module.css';
import { notifications } from '@mantine/notifications';

export default function Content() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const requiresReview = !session || !session.user.emailVerified;

  const form = useForm({
    initialValues: {
      recipient: '',
      body: '',
      isAnonymous: session ? false : true,
    },
    validate: zod4Resolver(createLetterServerInput),
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
          form.setFieldError('root', issue.message);
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
          label="Recipient"
          withAsterisk
          placeholder="Who is this letter for?"
          {...form.getInputProps('recipient')}
          className={classes['title-text-input']}
        />

        <Textarea
          label="Body"
          withAsterisk
          autosize
          minRows={8}
          maxRows={20}
          placeholder="What do you want to tell them?"
          {...form.getInputProps('body')}
        />

        {form.errors.root && (
          <Text size="xs" className={classes['root-error-messsage']}>
            {form.errors.root}
          </Text>
        )}

        <Group mt="md" justify="space-between">
          <Tooltip label="Sign in to post anonymously or with your name" disabled={!!session}>
            <span>
              <Switch
                label="Post anonymously"
                disabled={!session}
                {...form.getInputProps('isAnonymous', { type: 'checkbox' })}
              />
            </span>
          </Tooltip>

          <Button type="submit" loading={mutation.isPending}>
            Post it!
          </Button>
        </Group>
      </form>
    </Container>
  );
}
