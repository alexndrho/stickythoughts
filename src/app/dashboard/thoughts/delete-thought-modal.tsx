"use client";

import { useMutation } from "@tanstack/react-query";
import { Button, Group, Modal, Text } from "@mantine/core";

import { getQueryClient } from "@/lib/get-query-client";
import { type Thought } from "@/generated/prisma/client";
import { thoughtsOptions } from "@/app/(main)/options";
import { deleteThought } from "@/services/moderate/thought";

export interface DeleteThoughtModalProps {
  thought: Thought | null;
  opened: boolean;
  onClose: () => void;
}

export default function DeleteThoughtModal({
  thought,
  opened,
  onClose,
}: DeleteThoughtModalProps) {
  const mutation = useMutation({
    mutationFn: deleteThought,
    onSuccess: () => {
      onClose();

      const queryClient = getQueryClient();
      queryClient.invalidateQueries({
        queryKey: thoughtsOptions.queryKey,
      });
    },
  });

  return (
    <Modal
      title="Are you sure you want to delete this thought?"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Text mt="md" style={{ wordBreak: "break-word" }}>
        &quot;{thought?.message}&quot;
      </Text>
      <Text ta="end">-{thought?.author}</Text>

      <Group mt="md" justify="end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>

        <Button
          color="red"
          loading={mutation.isPending}
          onClick={() => {
            if (!thought) return;

            mutation.mutate(thought.id);
          }}
        >
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
