"use client";

import { useState } from "react";
import { UserWithRole } from "better-auth/plugins";
import { Button, Group, Modal } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconHammerOff, IconX } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { adminUsersOptions } from "./options";

export interface UnbanUserModalProps {
  user: UserWithRole | null;
  opened: boolean;
  onClose: () => void;
}

export default function UnbanUserModal({
  user,
  opened,
  onClose,
}: UnbanUserModalProps) {
  const [areYouSure, setAreYouSure] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authClient.admin.unbanUser({ userId: user?.id }),
    onSuccess: ({ error }) => {
      if (error) {
        if (error.message) {
          notifications.show({
            title: "Error Unbanning User",
            message: error.message || "An unknown error occurred.",
            color: "red",
            icon: <IconX size="1em" />,
          });
        }

        return;
      }

      const queryClient = getQueryClient();

      queryClient.invalidateQueries({
        queryKey: adminUsersOptions.queryKey,
      });

      handleClose();

      notifications.show({
        title: "User Unbanned",
        // @ts-expect-error - username exists but not in UserWithRole type
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
      // @ts-expect-error - username exists but not in UserWithRole type
      title={`Unban @${user?.username || "User"}`}
      opened={opened}
      onClose={handleClose}
      centered
    >
      <Group justify="end">
        <Button onClick={handleClose}>Cancel</Button>
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
          {areYouSure ? "Are you sure?" : "Unban User"}
        </Button>
      </Group>
    </Modal>
  );
}
