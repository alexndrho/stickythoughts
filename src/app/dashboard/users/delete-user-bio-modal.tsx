import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { Button, Group, Modal } from "@mantine/core";
import { IconFaceId, IconX } from "@tabler/icons-react";

import { getQueryClient } from "@/lib/get-query-client";
import { adminUsersOptions } from "./options";
import ServerError from "@/utils/error/ServerError";
import { userUsernameOptions } from "../../(main)/(core)/user/options";

export interface DeleteUserProfilePictureModalProps {
  user: {
    id: string;
    username: string;
  } | null;
  opened: boolean;
  onClose: () => void;
}

export default function DeleteUserBioModal({
  user,
  opened,
  onClose,
}: DeleteUserProfilePictureModalProps) {
  const [areYouSure, setAreYouSure] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      fetch(`/api/user/bio?userId=${user?.id || ""}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      const queryClient = getQueryClient();

      queryClient.invalidateQueries({
        queryKey: adminUsersOptions.queryKey,
      });

      if (user?.username) {
        queryClient.invalidateQueries({
          queryKey: userUsernameOptions(user.username).queryKey,
        });
      }

      notifications.show({
        title: "Bio Deleted",
        message: `Bio for @${user?.username} has been successfully deleted.`,
        icon: <IconFaceId size="1em" />,
      });

      handleClose();
    },
    onError: (error) => {
      if (error instanceof ServerError) {
        notifications.show({
          title: "Error Deleting Bio",
          message: error.issues[0].message || "An unknown error occurred.",
          color: "red",
          icon: <IconX size="1em" />,
        });
      } else {
        notifications.show({
          title: "Error Deleting Bio",
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
      title={`Delete Bio for @${user?.username}`}
      opened={opened}
      onClose={handleClose}
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
          {areYouSure ? "Are you sure?" : "Delete Bio"}
        </Button>
      </Group>
    </Modal>
  );
}
