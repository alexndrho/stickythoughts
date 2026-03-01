'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import {
  Alert,
  Avatar,
  Button,
  Container,
  Divider,
  Flex,
  Paper,
  Radio,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import { authClient } from '@/lib/auth-client';
import { LegalNoticeInline } from '@/components/legal-notice-inline';
import { createLetterServerInput } from '@/lib/validations/letter';
import { getQueryClient } from '@/lib/get-query-client';
import { letterKeys } from '@/lib/query-keys/letter';
import { searchKeys } from '@/lib/query-keys/search';
import { userKeys } from '@/lib/query-keys/user';
import { submitLetter } from '@/services/letter';
import ServerError from '@/utils/error/ServerError';
import { notifications } from '@mantine/notifications';
import {
  LETTER_BODY_MAX_LENGTH,
  LETTER_BODY_WARNING_THRESHOLD,
  LETTER_NAME_MAX_LENGTH,
  LETTER_RECIPIENT_WARNING_THRESHOLD,
} from '@/config/letter';
import { sanitizeString } from '@/utils/text';
import { useLegalNoticeAcknowledgement } from '@/hooks/use-legal-notice-acknowledgement';
import classes from './letter-submit.module.css';

export default function Content() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { isLegalNoticeAcknowledged, markAsLegalNoticeAcknowledged } =
    useLegalNoticeAcknowledgement();

  const requiresReview = !session || !session.user.emailVerified;

  const form = useForm({
    initialValues: {
      shareMode: 'anonymous' as 'anonymous' | 'you',
      anonymousFrom: '',
      recipient: '',
      body: '',
    },
    validate: zod4Resolver(createLetterServerInput),
  });

  const isAnonymousSelected = form.values.shareMode === 'anonymous';
  const isAsYouSelected = form.values.shareMode === 'you';
  const isAsYouSelectedWithSession = Boolean(session) && isAsYouSelected;

  const mutation = useMutation({
    mutationFn: submitLetter,
    onSuccess: ({ id }) => {
      markAsLegalNoticeAcknowledged();

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

  const clearFormFromError = () => {
    form.clearFieldError('anonymousFrom');
  };

  const showLegalNotice = !session && !isLegalNoticeAcknowledged;

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

      <form
        onSubmit={form.onSubmit((value) =>
          mutation.mutate({
            recipient: value.recipient,
            body: value.body,
            shareMode: session ? value.shareMode : 'anonymous',
            anonymousFrom:
              (session ? value.shareMode === 'anonymous' : true) && value.anonymousFrom
                ? sanitizeString(value.anonymousFrom)
                : undefined,
          }),
        )}
      >
        <Paper withBorder className={classes.header} role="radiogroup" aria-label="Share as">
          <div
            className={classes.header__card}
            onClick={() => {
              form.setFieldValue('shareMode', 'anonymous');
              clearFormFromError();
            }}
          >
            <Radio
              label="Share as: Anonymous"
              value="anonymous"
              checked={isAnonymousSelected}
              onChange={() => {
                form.setFieldValue('shareMode', 'anonymous');
                clearFormFromError();
              }}
            />

            <div className={classes.header__card__content}>
              <TextInput
                label="From"
                withAsterisk
                placeholder="Who is this letter from?"
                disabled={!isAnonymousSelected}
                maxLength={LETTER_NAME_MAX_LENGTH}
                rightSection={
                  LETTER_NAME_MAX_LENGTH - form.values.anonymousFrom.length <=
                    LETTER_RECIPIENT_WARNING_THRESHOLD && (
                    <Text size="sm" className={classes['length-indicator']}>
                      {LETTER_NAME_MAX_LENGTH - form.values.anonymousFrom.length}
                    </Text>
                  )
                }
                {...form.getInputProps('anonymousFrom')}
              />
            </div>
          </div>

          <Divider />

          <div
            className={`${classes.header__card}${!session ? ` ${classes['header__card--disabled']}` : ''}`}
            onClick={() => {
              if (!session) return;
              form.setFieldValue('shareMode', 'you');
              clearFormFromError();
            }}
          >
            <Radio
              label="Share as: As you"
              value="you"
              checked={isAsYouSelected}
              disabled={!session}
              onChange={() => {
                form.setFieldValue('shareMode', 'you');
                clearFormFromError();
              }}
            />

            <div
              className={`${classes.header__card__content} ${classes['header__card__content--user-display']}`}
            >
              <Avatar
                size="sm"
                color={isAsYouSelectedWithSession ? undefined : 'dimmed'}
                src={session?.user.image || undefined}
                alt={session?.user.name || undefined}
              />

              <Text c={isAsYouSelectedWithSession ? undefined : 'dimmed'}>
                {session
                  ? session.user.name || `@${session.user.username}`
                  : 'You need to sign in to share as you'}
              </Text>
            </div>
          </div>
        </Paper>

        <TextInput
          label="Recipient"
          withAsterisk
          placeholder="Who is this letter for?"
          maxLength={LETTER_NAME_MAX_LENGTH}
          rightSection={
            LETTER_NAME_MAX_LENGTH - form.values.recipient.length <=
              LETTER_RECIPIENT_WARNING_THRESHOLD && (
              <Text size="sm" className={classes['length-indicator']}>
                {LETTER_NAME_MAX_LENGTH - form.values.recipient.length}
              </Text>
            )
          }
          className={classes['recipient-input']}
          {...form.getInputProps('recipient')}
        />

        <Textarea
          label="Body"
          withAsterisk
          autosize
          minRows={8}
          maxRows={20}
          placeholder="What do you want to tell them?"
          maxLength={LETTER_BODY_MAX_LENGTH}
          rightSection={
            LETTER_BODY_MAX_LENGTH - form.values.body.length <= LETTER_BODY_WARNING_THRESHOLD && (
              <Text size="sm" className={classes['length-indicator']}>
                {LETTER_BODY_MAX_LENGTH - form.values.body.length}
              </Text>
            )
          }
          {...form.getInputProps('body')}
        />

        {form.errors.root && (
          <Text size="xs" className={classes['root-error-messsage']}>
            {form.errors.root}
          </Text>
        )}

        <Flex mt="md" justify={showLegalNotice ? 'space-between' : 'end'} gap="md">
          {showLegalNotice && <LegalNoticeInline variant="submit" />}

          <Button type="submit" loading={mutation.isPending} className={classes['submit-button']}>
            Post it!
          </Button>
        </Flex>
      </form>
    </Container>
  );
}
