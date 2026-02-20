'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { Anchor, Box, Button, Center, Group, Text, TextInput, Title } from '@mantine/core';
import { isEmail, useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { IconArrowLeft, IconMail } from '@tabler/icons-react';

import { AuthContainer } from '../auth-container';
import { authClient } from '@/lib/auth-client';
import classes from './forgot-password.module.css';

export interface StepOneProps {
  setEmail: (email: string) => void;
  nextStep: () => void;
}

export default function StepOne({ setEmail, nextStep }: StepOneProps) {
  const turnstileRef = useRef<TurnstileInstance>(null);

  const sendOTPForm = useForm({
    initialValues: {
      email: '',
      turnstileToken: '',
    },
    validate: {
      email: isEmail('Invalid email'),
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: async (values: typeof sendOTPForm.values) => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: 'forget-password',
        fetchOptions: {
          headers: {
            'x-captcha-response': values.turnstileToken,
          },
        },
      });

      if (data?.success) {
        setEmail(values.email);
        nextStep();
      } else if (error) {
        sendOTPForm.setFieldError('email', error.message);
        sendOTPForm.setFieldValue('turnstileToken', '');
        turnstileRef.current?.reset();
      } else {
        sendOTPForm.setFieldError('email', 'Failed to send verification code');
        sendOTPForm.setFieldValue('turnstileToken', '');
        turnstileRef.current?.reset();
      }
    },
    onError: () => {
      sendOTPForm.setFieldError('email', 'Failed to send verification code');
      sendOTPForm.setFieldValue('turnstileToken', '');
      turnstileRef.current?.reset();
    },
  });

  return (
    <Center>
      <AuthContainer>
        <form onSubmit={sendOTPForm.onSubmit((values) => sendOTPMutation.mutate(values))}>
          <Title order={2} className={classes['paper-title']}>
            Enter your email
          </Title>

          <TextInput
            label="Your email"
            placeholder="me@example.com"
            withAsterisk
            leftSection={<IconMail size="1em" />}
            {...sendOTPForm.getInputProps('email')}
          />

          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_AUTH_KEY!}
            className={classes.captcha}
            onSuccess={(token) => sendOTPForm.setFieldValue('turnstileToken', token)}
            onExpire={() => turnstileRef.current?.reset()}
            onError={() =>
              sendOTPForm.setFieldError('turnstileToken', 'Captcha verification failed')
            }
          />

          {(sendOTPForm.errors.root || sendOTPForm.errors.turnstileToken) && (
            <Text size="xs" className={classes['root-error-messsage']}>
              {sendOTPForm.errors.root || sendOTPForm.errors.turnstileToken}
            </Text>
          )}

          <Group mt="md" justify="space-between">
            <Anchor component={Link} href="/sign-in" c="dimmed" size="sm">
              <Center inline>
                <IconArrowLeft size={12} stroke={1.5} />
                <Box ml={5}>Back to the login page</Box>
              </Center>
            </Anchor>

            <Button
              type="submit"
              loading={sendOTPMutation.isPending}
              disabled={sendOTPForm.values.turnstileToken === ''}
            >
              Reset password
            </Button>
          </Group>
        </form>
      </AuthContainer>
    </Center>
  );
}
