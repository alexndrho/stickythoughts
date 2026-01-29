import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { Button, Group, Modal, Text } from "@mantine/core";

import { getQueryClient } from "@/lib/get-query-client";
import { authClient } from "@/lib/auth-client";

export interface DisconnectGoogleModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function DisconnectGoogleModal({
  opened,
  onClose,
}: DisconnectGoogleModalProps) {
  const mutation = useMutation({
    mutationFn: () =>
      authClient.unlinkAccount({
        providerId: "google",
      }),

    onSuccess: () => {
      const queryClient = getQueryClient();

      queryClient.invalidateQueries({
        queryKey: ["user", "account-list"],
      });

      onClose();
    },
    onError: (error) => {
      console.error("Failed to disconnect Google account:", error);

      notifications.show({
        title: "Error",
        message: "Failed to disconnect Google account. Please try again.",
        color: "red",
      });
    },
  });

  return (
    <Modal
      title="Disconnect Google Account"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text>Are you sure you want to disconnect your Google account?</Text>

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>

        <Button
          color="red"
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Disconnect
        </Button>
      </Group>
    </Modal>
  );
}
