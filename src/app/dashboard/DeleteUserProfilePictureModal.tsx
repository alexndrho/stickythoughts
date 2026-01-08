"use client";

import { useState } from "react";
import { type UserWithRole } from "better-auth/plugins";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { Button, Group, Modal } from "@mantine/core";
import { IconPhoto, IconX } from "@tabler/icons-react";

import { adminUsersOptions } from "./options";
import { getQueryClient } from "@/lib/get-query-client";
import { removeProfilePicture } from "@/services/user";
import ServerError from "@/utils/error/ServerError";

export interface DeleteUserProfilePictureModalProps {
  user: UserWithRole | null;
  opened: boolean;
  onClose: () => void;
}

export default function DeleteUserProfilePictureModal({
  user,
  opened,
  onClose,
}: DeleteUserProfilePictureModalProps) {
  const [areYouSure, setAreYouSure] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      removeProfilePicture({
        userId: user?.id || "",
      }),
    onSuccess: () => {
      handleClose();

      const queryClient = getQueryClient();

      queryClient.invalidateQueries({
        queryKey: adminUsersOptions.queryKey,
      });

      notifications.show({
        title: "Profile Picture Deleted",
        // @ts-expect-error - username exists but not in UserWithRole type
        message: `Profile picture for @${user?.username} has been successfully deleted.`,
        icon: <IconPhoto size="1em" />,
      });
    },
    onError: (error) => {
      if (error instanceof ServerError) {
        notifications.show({
          title: "Error Deleting Profile Picture",
          message: error.issues[0].message || "An unknown error occurred.",
          color: "red",
          icon: <IconX size="1em" />,
        });
      } else {
        notifications.show({
          title: "Error Deleting Profile Picture",
          message: "An unknown error occurred.",
          color: "red",
          icon: <IconX size="1em" />,
        });
      }
    },
  });

  const handleClose = () => {
    setAreYouSure(false);
    onClose();
  };

  return (
    <Modal
      // @ts-expect-error - username exists but not in UserWithRole type
      title={`Delete Profile Picture for @${user?.username}`}
      opened={opened}
      onClose={onClose}
      centered
    >
      <Group justify="end">
        <Button variant="default">Cancel</Button>

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
          {areYouSure ? "Are you sure?" : "Delete Profile Picture"}
        </Button>
      </Group>
    </Modal>
  );
}
