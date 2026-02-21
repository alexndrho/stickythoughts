'use client';

import { useState } from 'react';
import { Button, Group, Modal } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { IconHammerOff, IconX } from '@tabler/icons-react';

import { authClient } from '@/lib/auth-client';
import { getQueryClient } from '@/lib/get-query-client';
import { adminKeys } from '@/lib/query-keys/admin';
import { userKeys } from '@/lib/query-keys/user';

export interface UnbanUserModalProps {
  user: {
    id: string;
    username: string;
  } | null;
  opened: boolean;
  onClose: () => void;
}

export default function UnbanUserModal({ user, opened, onClose }: UnbanUserModalProps) {
  const [areYouSure, setAreYouSure] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authClient.admin.unbanUser({ userId: user?.id }),
    onSuccess: ({ error }) => {
      if (error) {
        if (error.message) {
          notifications.show({
            title: 'Error Unbanning User',
            message: error.message || 'An unknown error occurred.',
            color: 'red',
            icon: <IconX size="1em" />,
          });
        }

        return;
      }

      const queryClient = getQueryClient();

      queryClient.invalidateQueries({
        queryKey: adminKeys.users(),
      });

      if (user?.username) {
        queryClient.invalidateQueries({
          queryKey: userKeys.byUsername(user.username),
        });
      }

      handleClose();

      notifications.show({
        title: 'User Unbanned',
        message: `@${user?.username} has been successfully unbanned.`,
        icon: <IconHammerOff size="1em" />,
      });
    },
  });

  const handleClose = () => {
    setAreYouSure(false);
    onClose();
  };

  return (
    <Modal
      title={`Unban @${user?.username || 'User'}`}
      opened={opened}
      onClose={handleClose}
      centered
    >
      <Group justify="end">
        <Button variant="default" onClick={handleClose}>
          Cancel
        </Button>

        <Button
          color="red"
          loading={mutation.isPending}
          onClick={() => {
            if (!areYouSure) {
              setAreYouSure(true);
              return;
            }
            mutation.mutate();
          }}
        >
          {areYouSure ? 'Are you sure?' : 'Unban User'}
        </Button>
      </Group>
    </Modal>
  );
}
