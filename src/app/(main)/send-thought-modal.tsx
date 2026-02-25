'use client';

import { useMutation } from '@tanstack/react-query';
import { Button, Flex, Group, Modal, Text, TextInput, Textarea, Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useLocalStorage } from '@mantine/hooks';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { notifications } from '@mantine/notifications';
import { IconMessage } from '@tabler/icons-react';

import { authClient } from '@/lib/auth-client';
import { getQueryClient } from '@/lib/get-query-client';
import RandomButton from '@/components/random-button';
import CheckColorSwatch from '@/components/check-color-swatch';
import { LegalNoticeInline } from '@/components/legal-notice-inline';
import { useLegalNoticeAcknowledgement } from '@/hooks/use-legal-notice-acknowledgement';
import { thoughtKeys } from '@/lib/query-keys/thought';
import { submitThought } from '@/services/thought';
import { createThoughtInput } from '@/lib/validations/thought';
import {
  THOUGHT_MAX_AUTHOR_LENGTH,
  THOUGHT_MAX_MESSAGE_LENGTH,
  THOUGHT_COLORS,
  THOUGHT_MESSAGE_WARNING_THRESHOLD,
  THOUGHT_AUTHOR_WARNING_THRESHOLD,
} from '@/config/thought';
import ServerError from '@/utils/error/ServerError';
import classes from './home.module.css';

export interface SendThoughtModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SendThoughtModal({ open, onClose }: SendThoughtModalProps) {
  const { data: session } = authClient.useSession();
  const { isLegalNoticeAcknowledged, markAsLegalNoticeAcknowledged } =
    useLegalNoticeAcknowledgement();

  const [storedAuthor, setStoredAuthor] = useLocalStorage<string>({
    key: 'author',
    defaultValue: '',
    getInitialValueInEffect: false,
  });

  const form = useForm({
    initialValues: {
      message: '',
      author: storedAuthor,
      color: THOUGHT_COLORS[0] as (typeof THOUGHT_COLORS)[number],
    },
    validate: zod4Resolver(createThoughtInput),
  });

  const handleRandomColor = () => {
    // Get all colors except the current one.
    const colors = THOUGHT_COLORS.filter((color) => color !== form.values.color);

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    form.setFieldValue('color', randomColor);
  };

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      const response = await submitThought({
        ...values,
      });

      return { response, formValues: values };
    },
    onError: (error) => {
      if (error instanceof ServerError) {
        form.setFieldError('root', error.issues[0].message);

        return;
      } else {
        console.error(error);
        notifications.show({
          title: 'Failed to submit thought',
          message: 'An error occurred while submitting your thought.',
          color: 'red',
        });
      }
    },
    onSuccess: ({ formValues }) => {
      setStoredAuthor(formValues.author);
      markAsLegalNoticeAcknowledged();

      form.setInitialValues({
        message: '',
        author: formValues.author,
        color: THOUGHT_COLORS[0],
      });

      getQueryClient().invalidateQueries({
        queryKey: thoughtKeys.infinite(),
      });

      getQueryClient().invalidateQueries({
        queryKey: thoughtKeys.all(),
      });

      notifications.show({
        title: 'Thought submitted!',
        message: 'Your thought has been successfully submitted.',
        color: `${form.values.color}.6`,
        icon: <IconMessage size="1em" />,
      });

      onClose();
      form.reset();
    },
  });

  const showLegalNotice = !session && !isLegalNoticeAcknowledged;

  return (
    <Modal opened={open} onClose={onClose} title="Share a thought" centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <Textarea
          label="Message"
          withAsterisk
          placeholder="What do you want to say?"
          rows={5}
          maxLength={THOUGHT_MAX_MESSAGE_LENGTH}
          disabled={mutation.isPending}
          rightSection={
            THOUGHT_MAX_MESSAGE_LENGTH - form.values.message.length <=
              THOUGHT_MESSAGE_WARNING_THRESHOLD && (
              <Text size="sm" className={classes['send-thought-modal__message-length-indicator']}>
                {THOUGHT_MAX_MESSAGE_LENGTH - form.values.message.length}
              </Text>
            )
          }
          {...form.getInputProps('message')}
          className={classes['send-thought-modal__text-input']}
        />

        <TextInput
          label="Author"
          withAsterisk
          placeholder="Who is this thought from?"
          maxLength={THOUGHT_MAX_AUTHOR_LENGTH}
          disabled={mutation.isPending}
          leftSection={'\u2013'}
          rightSection={
            THOUGHT_MAX_AUTHOR_LENGTH - form.values.author.length <=
              THOUGHT_AUTHOR_WARNING_THRESHOLD && (
              <Text size="sm" className={classes['send-thought-modal__message-length-indicator']}>
                {THOUGHT_MAX_AUTHOR_LENGTH - form.values.author.length}
              </Text>
            )
          }
          {...form.getInputProps('author')}
          className={classes['send-thought-modal__text-input']}
        />

        {form.errors.root && (
          <Text size="xs" className={classes['send-thought-modal__root-error-messsage']}>
            {form.errors.root}
          </Text>
        )}

        <Group mt="md" justify="center">
          <Tooltip label="Randomize color" position="left">
            <RandomButton onClick={handleRandomColor} />
          </Tooltip>

          {THOUGHT_COLORS.map((color) => (
            <CheckColorSwatch
              key={color}
              color={color}
              onClick={() => form.setFieldValue('color', color)}
              checked={form.values.color === color}
              disabled={mutation.isPending}
            />
          ))}
        </Group>

        <Flex mt="md" justify={showLegalNotice ? 'space-between' : 'end'} gap="md">
          {showLegalNotice && <LegalNoticeInline variant="submit" />}

          <Button
            type="submit"
            loading={mutation.isPending}
            className={classes['send-thought-modal__submit-button']}
          >
            Stick it!
          </Button>
        </Flex>
      </form>
    </Modal>
  );
}
