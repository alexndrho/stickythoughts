"use client";

import { authClient } from "@/lib/auth-client";
import { Button, Group, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconClock, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { useState } from "react";
import { adminKeys } from "@/lib/query-keys";

export interface RevokeUserSessionsModalProps {
  user: {
    id: string;
    username: string;
  } | null;
  opened: boolean;
  onClose: () => void;
}

export default function RevokeUserSessionsModal({
  user,
  opened,
  onClose,
}: RevokeUserSessionsModalProps) {
  const [areYouSure, setAreYouSure] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authClient.admin.revokeUserSessions({ userId: user?.id }),
    onSuccess: ({ error }) => {
      if (error) {
        notifications.show({
          title: "Error Revoking Sessions",
          message: error.message || "An unknown error occurred.",
          color: "red",
          icon: <IconX size="1em" />,
        });
        return;
      }

      const queryClient = getQueryClient();
      queryClient.invalidateQueries({
        queryKey: adminKeys.users(),
      });

      handleClose();

      notifications.show({
        title: "Sessions Revoked",
        // @ts-expect-error - username exists but not in UserWithRole type
        message: `All sessions for @${user.username} have been revoked.`,
        icon: <IconClock size="1em" />,
      });
    },
  });

  const handleClose = () => {
    onClose();
    setAreYouSure(false);
  };

  return (
    <Modal
      title={`Revoke all sessions for @${user?.username}`}
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
          {areYouSure ? "Are you sure?" : "Revoke All Sessions"}
        </Button>
      </Group>
    </Modal>
  );
}
