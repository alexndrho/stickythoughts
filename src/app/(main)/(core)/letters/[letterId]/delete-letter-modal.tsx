import { useMutation } from "@tanstack/react-query";
import { Button, Flex, Modal, Text } from "@mantine/core";

import { getQueryClient } from "@/lib/get-query-client";
import { lettersInfiniteOptions } from "@/app/(main)/(core)/letters/options";
import { userUsernameLettersInfiniteOptions } from "@/app/(main)/(core)/user/options";
import { deletedLettersOptions } from "@/app/dashboard/deleted/options";
import { deleteLetter } from "@/services/letter";

export interface DeleteLetterModalProps {
  id: string;
  title: string;
  authorUsername?: string;
  opened: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export default function DeleteLetterModal({
  id,
  title,
  authorUsername,
  opened,
  onClose,
  onDelete,
}: DeleteLetterModalProps) {
  const deleteMutation = useMutation({
    mutationFn: () => deleteLetter(id),
    onSuccess: () => {
      if (onDelete) onDelete();

      const queryClient = getQueryClient();
      queryClient.invalidateQueries({
        queryKey: lettersInfiniteOptions.queryKey,
      });

      queryClient.invalidateQueries({
        queryKey: deletedLettersOptions.queryKey,
      });

      if (authorUsername) {
        queryClient.invalidateQueries({
          queryKey: userUsernameLettersInfiniteOptions(authorUsername).queryKey,
        });
      }

      onClose();
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Are you sure you want to delete "${title}"?`}
      centered
    >
      <Text mb="md">
        This action cannot be undone. Please confirm that you want to delete
        this post.
      </Text>

      <Flex justify="end" gap="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>

        <Button
          color="red"
          loading={deleteMutation.isPending}
          onClick={() => deleteMutation.mutate()}
        >
          Delete
        </Button>
      </Flex>
    </Modal>
  );
}
