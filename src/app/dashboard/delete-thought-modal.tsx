"use client";

import { useMutation } from "@tanstack/react-query";
import { Button, Group, Modal } from "@mantine/core";

import { getQueryClient } from "@/lib/get-query-client";
import { thoughtKeys } from "@/lib/query-keys";
import { adminKeys } from "@/lib/query-keys";
import { deleteThought } from "@/services/moderate/thought";
import Thought from "../(main)/thought";
import type { PublicThoughtPayload } from "@/types/thought";

export interface DeleteThoughtModalProps {
  thought: PublicThoughtPayload | null;
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
        queryKey: thoughtKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: adminKeys.thoughts(),
      });
      queryClient.invalidateQueries({
        queryKey: adminKeys.deletedThoughts(),
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
      <Thought
        message={thought?.message ?? "No thought selected yet."}
        author={thought?.author ?? "Unknown"}
        color={thought?.color}
        fluid
      />

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
