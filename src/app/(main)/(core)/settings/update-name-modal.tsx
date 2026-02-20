'use client';

import { useEffect, useEffectEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Group, Modal, TextInput } from '@mantine/core';

import { authClient } from '@/lib/auth-client';
import { useForm } from '@mantine/form';

export interface UpdateNameModalProps {
  opened: boolean;
  onClose: () => void;
  defaultValue?: string;
}

export default function UpdateNameModal({ opened, onClose, defaultValue }: UpdateNameModalProps) {
  const form = useForm({
    initialValues: {
      name: defaultValue,
    },
  });

  const setFormName = useEffectEvent((name?: string) => {
    form.setInitialValues({ name: name || '' });
    form.setValues({ name: name || '' });
  });

  useEffect(() => {
    setFormName(defaultValue);
  }, [defaultValue]);

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) => authClient.updateUser(values),
    onSuccess: ({ error }) => {
      if (error) {
        form.setFieldError('name', error.message);
        return;
      }

      form.reset();
      onClose();
    },
    onError: (error) => {
      form.setFieldError('name', error.message);
    },
  });

  return (
    <Modal title="Update Name" opened={opened} onClose={onClose} centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <Group align="end">
          <TextInput
            flex={1}
            label="Name"
            placeholder={defaultValue || 'Enter your name'}
            {...form.getInputProps('name')}
          />

          <Button type="submit" loading={mutation.isPending}>
            Update
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
