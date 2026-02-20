"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ActionIcon,
  Loader,
  Paper,
  Skeleton,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconStar, IconStarFilled, IconTrash } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import {
  adminThoughtsPageOptions,
  highlightedThoughtOptions,
} from "@/app/dashboard/options";
import { getFormattedDate } from "@/utils/date";
import { thoughtCountOptions } from "@/app/(main)/options";
import { ADMIN_THOUGHTS_PER_PAGE } from "@/config/admin";
import DeleteThoughtModal from "./delete-thought-modal";
import ServerError from "@/utils/error/ServerError";
import {
  highlightThought,
  removeThoughtHighlight,
} from "@/services/moderate/thought";
import {
  formatHighlightedThoughtLockRemaining,
  isHighlightedThoughtLocked,
} from "@/utils/thought";
import { setThoughtHighlighting } from "./set-query";
import HighlightThoughtModal from "./highlight-thought-modal";
import RemoveHighlightModal from "./remove-highlight-modal";
import Thought from "@/components/thought";
import { formatUserDisplayName } from "@/utils/user";
import type { PrivateThought } from "@/types/thought";
import dashboardClasses from "./dashboard.module.css";
import PaginatedPanelLayout from "./paginated-panel-layout";

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
  const { data: session } = authClient.useSession();

  const [page, setPage] = useState(1);

  const { data: highlightedThought, isFetched: isHighlightedThoughtFetched } =
    useQuery(highlightedThoughtOptions);
  const { data: thoughts, isFetching: isThoughtsFetching } = useQuery(
    adminThoughtsPageOptions(page),
  );

  const { data: count } = useQuery(thoughtCountOptions);

  const [deletingThought, setDeletingThought] = useState<PrivateThought | null>(
    null,
  );
  const [highlightingThought, setHighlightingThought] =
    useState<PrivateThought | null>(null);
  const [unhighlightingThought, setUnhighlightingThought] =
    useState<PrivateThought | null>(null);
  const highlightMutation = useMutation({
    mutationFn: highlightThought,
    onSuccess: (data) => {
      setThoughtHighlighting({
        thought: data,
        page,
      });

      setHighlightingThought(null);
    },
  });

  const removeHighlightMutation = useMutation({
    mutationFn: removeThoughtHighlight,
    onSuccess: () => {
      setThoughtHighlighting({
        thought: null,
        page,
      });

      setUnhighlightingThought(null);
    },
  });

  const hasHighlightedThought =
    isHighlightedThoughtFetched && !!highlightedThought;

  const isAdmin = session?.user.role === "admin";
  const isHighlightLocked =
    !!highlightedThought &&
    isHighlightedThoughtLocked(highlightedThought.highlightedAt);
  const allowHighlighting =
    !!isAdmin || (isHighlightedThoughtFetched && !isHighlightLocked);

  const highlightTooltipLabel = !isHighlightedThoughtFetched
    ? "Loading..."
    : allowHighlighting
      ? "Highlight thought"
      : `Highlighting is on cooldown for ${formatHighlightedThoughtLockRemaining(
          highlightedThought?.highlightedAt ?? null,
        )}`;
  const unhighlightTooltipLabel = !isHighlightedThoughtFetched
    ? "Loading..."
    : !highlightedThought
      ? "No highlighted thought to remove."
      : allowHighlighting
        ? "Remove current highlight"
        : `Highlighting is on cooldown for ${formatHighlightedThoughtLockRemaining(
            highlightedThought.highlightedAt,
          )}`;

  const handleOpenDeleteModal = (thought?: PrivateThought | null) => {
    if (!thought) return;

    setDeletingThought(thought);
  };

  const handleCloseDeleteModal = () => {
    setDeletingThought(null);
  };

  const handleOpenHighlightModal = (thought: PrivateThought) => {
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

  const handleOpenUnhighlightModal = (thought?: PrivateThought | null) => {
    if (!thought) return;

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

      <Paper
        withBorder
        className={dashboardClasses["thought-highlighted-card"]}
      >
        <div className={dashboardClasses["thought-highlighted-card__header"]}>
          <Title
            order={2}
            className={dashboardClasses["thought-highlighted-card__title"]}
          >
            Highlighted Thought
          </Title>

          <ActionIcon.Group>
            <Tooltip label={unhighlightTooltipLabel}>
              <ActionIcon
                color="yellow"
                disabled={!highlightedThought || !allowHighlighting}
                aria-label="Remove Highlight"
                onClick={() => {
                  handleOpenUnhighlightModal(highlightedThought);
                }}
              >
                <IconStarFilled size="1em" />
              </ActionIcon>
            </Tooltip>

            <Tooltip
              label={
                highlightedThought
                  ? "Delete highlighted thought"
                  : "No highlighted thought to delete."
              }
            >
              <ActionIcon
                color="red"
                disabled={!highlightedThought}
                aria-label="Delete Highlighted Thought"
                onClick={() => handleOpenDeleteModal(highlightedThought)}
              >
                <IconTrash size="1em" />
              </ActionIcon>
            </Tooltip>
          </ActionIcon.Group>
        </div>

        <Thought
          message={
            hasHighlightedThought
              ? highlightedThought?.message
              : "No highlighted thought yet. Share something meaningful and it could land here."
          }
          author={
            hasHighlightedThought ? highlightedThought?.author : "The community"
          }
          color={highlightedThought?.color}
          fluid
          loading={!isHighlightedThoughtFetched}
        />

        <Skeleton mt="xs" visible={!isHighlightedThoughtFetched}>
          <Text
            size="sm"
            className={dashboardClasses["thought-highlighted-card__details"]}
          >
            Highlighted at:{" "}
            {hasHighlightedThought
              ? getFormattedDate(highlightedThought.highlightedAt)
              : "-"}{" "}
            {hasHighlightedThought &&
              `(unlocks in ${formatHighlightedThoughtLockRemaining(
                highlightedThought.highlightedAt,
              )})`}
          </Text>
        </Skeleton>

        <Skeleton visible={!isHighlightedThoughtFetched}>
          <Text
            size="sm"
            className={dashboardClasses["thought-highlighted-card__details"]}
          >
            Highlighted by:{" "}
            {hasHighlightedThought
              ? formatUserDisplayName(highlightedThought.highlightedBy)
              : "-"}
          </Text>
        </Skeleton>
      </Paper>

      <PaginatedPanelLayout
        page={page}
        onPageChange={setPage}
        total={Math.ceil((count || 0) / ADMIN_THOUGHTS_PER_PAGE)}
      >
        <Table.ScrollContainer minWidth="100%" maxHeight="100%">
          <Table highlightOnHover withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Author</Table.Th>
                <Table.Th>Message</Table.Th>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {thoughts?.map((thought) => (
                <Table.Tr key={thought.id}>
                  <Table.Td>{thought.author}</Table.Td>

                  <Table.Td>
                    <Text>{thought.message}</Text>
                  </Table.Td>

                  <Table.Td>{getFormattedDate(thought.createdAt)}</Table.Td>

                  <Table.Td>
                    <ActionIcon.Group>
                      <Tooltip label={highlightTooltipLabel}>
                        <ActionIcon
                          aria-label="Highlight Thought"
                          variant="default"
                          onClick={() => handleOpenHighlightModal(thought)}
                          loading={
                            (highlightMutation.isPending &&
                              highlightingThought?.id === thought.id) ||
                            (removeHighlightMutation.isPending &&
                              unhighlightingThought?.id === thought.id)
                          }
                          disabled={
                            !allowHighlighting ||
                            highlightMutation.isPending ||
                            removeHighlightMutation.isPending
                          }
                        >
                          <IconStar size="1em" />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label={"Delete thought"}>
                        <ActionIcon
                          aria-label="Delete Thought"
                          color="red"
                          onClick={() => handleOpenDeleteModal(thought)}
                        >
                          <IconTrash size="1em" />
                        </ActionIcon>
                      </Tooltip>
                    </ActionIcon.Group>
                  </Table.Td>
                </Table.Tr>
              ))}

              {isThoughtsFetching ? (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center">
                    <Loader />
                  </Table.Td>
                </Table.Tr>
              ) : (
                thoughts?.length === 0 && (
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
      </PaginatedPanelLayout>

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
