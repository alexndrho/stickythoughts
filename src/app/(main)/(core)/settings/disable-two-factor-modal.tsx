'use client';

import { isNotEmpty, useForm } from '@mantine/form';
import { Button, Group, Modal, PasswordInput } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { notifications } from '@mantine/notifications';

export interface DisableTwoFactorModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function DisableTwoFactorModal({ opened, onClose }: DisableTwoFactorModalProps) {
  const form = useForm({
    initialValues: {
      password: '',
    },
    validate: {
      password: isNotEmpty('Password is required'),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      authClient.twoFactor.disable({
        password: values.password,
      }),
    onSuccess: ({ error }) => {
      if (error?.message) {
        form.setErrors({ password: error.message });
      } else if (error) {
        form.setErrors({
          password: 'Failed to disable two-factor authentication.',
        });
      } else {
        onClose();
        form.reset();

        notifications.show({
          title: 'Two-Factor Authentication Disabled',
          message: 'Two-factor authentication has been successfully disabled for your account.',
          color: 'green',
        });
      }
    },
  });

  return (
    <Modal title="Disable Two-Factor Authentication" opened={opened} onClose={onClose} centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <PasswordInput label="Password" withAsterisk {...form.getInputProps('password')} />

        <Group mt="md" justify="end">
          <Button type="submit" loading={mutation.isPending}>
            Disable 2FA
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
