'use client';

import { useEffect, useEffectEvent } from 'react';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { Button, Group, Modal, Select } from '@mantine/core';

import { VisibilityLevel } from '@/generated/prisma/enums';
import { updateUserLikesVisibility } from '@/services/user';
import ServerError from '@/utils/error/ServerError';
import { setUserSettingsPrivacyQuery } from './set-query';

export interface LikesVisibilityModalProps {
  initialVisibility?: VisibilityLevel;
  opened: boolean;
  onClose: () => void;
}

export default function LikesVisibilityModal({
  initialVisibility,
  opened,
  onClose,
}: LikesVisibilityModalProps) {
  const form = useForm({
    initialValues: {
      visibility: initialVisibility ?? VisibilityLevel.PUBLIC,
    },
  });

  const setFormInitialValuesEffectEvent = useEffectEvent(() => {
    form.setInitialValues({
      visibility: initialVisibility ?? VisibilityLevel.PUBLIC,
    });
    form.setValues({
      visibility: initialVisibility ?? VisibilityLevel.PUBLIC,
    });
  });

  useEffect(() => {
    setFormInitialValuesEffectEvent();
  }, [initialVisibility]);

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      updateUserLikesVisibility({ visibility: values.visibility }),
    onSuccess: (data) => {
      if (!data) return;

      setUserSettingsPrivacyQuery({
        privateLikes: data.likesVisibility,
      });

      onClose();
    },
    onError: (error) => {
      if (error instanceof ServerError && error.issues[0]?.message) {
        form.setFieldError('visibility', error.issues[0].message);
      } else {
        form.setFieldError('visibility', 'An error occurred');
      }
    },
  });

  return (
    <Modal title="Likes Visibility" opened={opened} onClose={onClose} centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <Select
          label="Who can see your likes"
          data={[
            { value: VisibilityLevel.PUBLIC, label: 'Public' },
            { value: VisibilityLevel.PRIVATE, label: 'Private' },
          ]}
          allowDeselect={false}
          withAsterisk
          {...form.getInputProps('visibility')}
        />

        <Group mt="md" justify="end">
          <Button type="submit" loading={mutation.isPending}>
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
