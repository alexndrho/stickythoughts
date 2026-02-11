"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ActionIcon,
  Loader,
  Pagination,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconStar, IconStarFilled, IconTrash } from "@tabler/icons-react";

import { getQueryClient } from "@/lib/get-query-client";
import { thoughtKeys } from "@/lib/query-keys";
import { getFormattedDate } from "@/utils/date";
import { formatUserDisplayName } from "@/utils/user";
import { adminThoughtsPageOptions } from "@/app/dashboard/options";
import { ADMIN_THOUGHTS_PER_PAGE } from "@/config/admin";
import { thoughtCountOptions } from "@/app/(main)/options";
import dashboardClasses from "./dashboard.module.css";
import DeleteThoughtModal from "./delete-thought-modal";
import type { PrivateThoughtPayload } from "@/types/thought";
import ServerError from "@/utils/error/ServerError";
import {
  highlightThought,
  removeThoughtHighlight,
} from "@/services/moderate/thought";
import { setThoughtHighlighting } from "./set-query";
import HighlightThoughtModal from "./highlight-thought-modal";
import RemoveHighlightModal from "./remove-highlight-modal";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ServerError && error.issues.length > 0) {
    return error.issues[0].message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

export default function Content() {
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery(adminThoughtsPageOptions(page));

  const { data: count } = useQuery(thoughtCountOptions);

  const [deletingThought, setDeletingThought] =
    useState<PrivateThoughtPayload | null>(null);
  const [highlightingThought, setHighlightingThought] =
    useState<PrivateThoughtPayload | null>(null);
  const [unhighlightingThought, setUnhighlightingThought] =
    useState<PrivateThoughtPayload | null>(null);
  const highlightMutation = useMutation({
    mutationFn: highlightThought,
    onSuccess: (data) => {
      setThoughtHighlighting({
        thought: data,
        page,
      });
      setHighlightingThought(null);

      const queryClient = getQueryClient();
      queryClient.invalidateQueries({
        queryKey: thoughtKeys.highlighted(),
      });
    },
  });

  const removeHighlightMutation = useMutation({
    mutationFn: removeThoughtHighlight,
    onSuccess: (data) => {
      setThoughtHighlighting({
        thought: data,
        page,
      });
      setUnhighlightingThought(null);

      const queryClient = getQueryClient();
      queryClient.invalidateQueries({
        queryKey: thoughtKeys.highlighted(),
      });
    },
  });

  const handleOpenDeleteModal = (thought: PrivateThoughtPayload) => {
    setDeletingThought(thought);
  };

  const handleCloseDeleteModal = () => {
    setDeletingThought(null);
  };

  const handleOpenHighlightModal = (thought: PrivateThoughtPayload) => {
    setHighlightingThought(thought);
  };

  const handleCloseHighlightModal = () => {
    setHighlightingThought(null);
    highlightMutation.reset();
  };

  const handleConfirmHighlight = () => {
    if (!highlightingThought) return;

    highlightMutation.mutate(highlightingThought.id);
  };

  const handleOpenUnhighlightModal = (thought: PrivateThoughtPayload) => {
    setUnhighlightingThought(thought);
  };

  const handleCloseUnhighlightModal = () => {
    setUnhighlightingThought(null);
    removeHighlightMutation.reset();
  };

  const handleConfirmUnhighlight = () => {
    if (!unhighlightingThought) return;

    removeHighlightMutation.mutate(unhighlightingThought.id);
  };

  return (
    <div className={dashboardClasses.container}>
      <Title className={dashboardClasses.title}>Thoughts</Title>

      <div className={dashboardClasses["table-container"]}>
        <Table.ScrollContainer minWidth="100%" maxHeight="100%">
          <Table highlightOnHover withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Author</Table.Th>
                <Table.Th>Message</Table.Th>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Highlighted By</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {data?.map((thought) => (
                <Table.Tr key={thought.id}>
                  <Table.Td>{thought.author}</Table.Td>

                  <Table.Td>
                    <Text>{thought.message}</Text>
                  </Table.Td>

                  <Table.Td>{getFormattedDate(thought.createdAt)}</Table.Td>

                  <Table.Td>
                    {thought.highlightedAt && thought.highlightedBy
                      ? formatUserDisplayName(thought.highlightedBy)
                      : "—"}
                  </Table.Td>

                  <Table.Td>
                    <ActionIcon.Group>
                      <ActionIcon
                        aria-label="Highlight Thought"
                        variant={thought.highlightedAt ? "light" : "default"}
                        color={thought.highlightedAt ? "yellow" : undefined}
                        onClick={() => {
                          if (thought.highlightedAt) {
                            handleOpenUnhighlightModal(thought);
                            return;
                          }

                          handleOpenHighlightModal(thought);
                        }}
                        loading={
                          (highlightMutation.isPending &&
                            highlightingThought?.id === thought.id) ||
                          (removeHighlightMutation.isPending &&
                            unhighlightingThought?.id === thought.id)
                        }
                        disabled={
                          highlightMutation.isPending ||
                          removeHighlightMutation.isPending
                        }
                      >
                        {thought.highlightedAt ? (
                          <IconStarFilled size="1em" />
                        ) : (
                          <IconStar size="1em" />
                        )}
                      </ActionIcon>

                      <ActionIcon
                        aria-label="Delete Thought"
                        color="red"
                        onClick={() => handleOpenDeleteModal(thought)}
                      >
                        <IconTrash size="1em" />
                      </ActionIcon>
                    </ActionIcon.Group>
                  </Table.Td>
                </Table.Tr>
              ))}

              {isFetching ? (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center">
                    <Loader />
                  </Table.Td>
                </Table.Tr>
              ) : (
                data?.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={5} ta="center">
                      No thoughts found.
                    </Table.Td>
                  </Table.Tr>
                )
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>

      <Pagination
        mt="md"
        value={page}
        onChange={setPage}
        total={Math.ceil((count || 0) / ADMIN_THOUGHTS_PER_PAGE)}
      />

      <DeleteThoughtModal
        thought={deletingThought}
        opened={!!deletingThought}
        onClose={handleCloseDeleteModal}
      />

      <HighlightThoughtModal
        thought={highlightingThought}
        opened={!!highlightingThought}
        onClose={handleCloseHighlightModal}
        onConfirm={handleConfirmHighlight}
        isPending={highlightMutation.isPending}
        error={
          highlightMutation.isError
            ? getErrorMessage(highlightMutation.error)
            : undefined
        }
      />

      <RemoveHighlightModal
        thought={unhighlightingThought}
        opened={!!unhighlightingThought}
        onClose={handleCloseUnhighlightModal}
        onConfirm={handleConfirmUnhighlight}
        isPending={removeHighlightMutation.isPending}
        error={
          removeHighlightMutation.isError
            ? getErrorMessage(removeHighlightMutation.error)
            : undefined
        }
      />
    </div>
  );
}
