"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ActionIcon,
  Loader,
  Pagination,
  Table,
  Tabs,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconArrowBackUp, IconTrashX } from "@tabler/icons-react";

import {
  deletedThoughtsCountOptions,
  deletedThoughtsPageOptions,
} from "./options";
import { ADMIN_DELETED_PER_PAGE } from "@/config/admin";
import classes from "./deleted.module.css";
import { getFormattedDate } from "@/utils/date";
import {
  formatDeletedByLabel,
  formatDeletedDate,
  getPagedTotal,
} from "./utils";
import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { adminKeys } from "@/lib/query-keys";
import { thoughtKeys } from "@/lib/query-keys";
import type { DeletedThoughtFromServer } from "@/types/deleted";
import {
  permanentlyDeleteThought,
  restoreDeletedThought,
} from "@/services/moderate/deleted";
import {
  PermanentlyDeleteThoughtModal,
  RecoverThoughtModal,
} from "./thought-modals";
import dashboardClasses from "../dashboard.module.css";

export interface ThoughtsTabProps {
  isActive: boolean;
}

export default function ThoughtsTab({ isActive }: ThoughtsTabProps) {
  const [page, setPage] = useState(1);
  const [permanentlyDeletingThought, setPermanentlyDeletingThought] =
    useState<DeletedThoughtFromServer | null>(null);
  const [restoringThought, setRestoringThought] =
    useState<DeletedThoughtFromServer | null>(null);
  const [restoringThoughtId, setRestoringThoughtId] = useState<string | null>(
    null,
  );
  const [deletingThoughtId, setDeletingThoughtId] = useState<string | null>(
    null,
  );

  const { data: session } = authClient.useSession();
  const role = session?.user?.role;
  const isStaff = role === "admin" || role === "moderator";
  const canRestoreThought = isStaff
    ? authClient.admin.checkRolePermission({
        role,
        permission: {
          thought: ["restore"],
        },
      })
    : false;
  const canPermanentlyDeleteThought = isStaff
    ? authClient.admin.checkRolePermission({
        role,
        permission: {
          thought: ["purge"],
        },
      })
    : false;

  const { data, isFetching } = useQuery({
    ...deletedThoughtsPageOptions(page),
    enabled: isActive,
  });

  const { data: totalCount } = useQuery({
    ...deletedThoughtsCountOptions(),
    enabled: isActive,
  });

  const total = getPagedTotal(totalCount, ADMIN_DELETED_PER_PAGE);

  const handleInvalidate = () => {
    const queryClient = getQueryClient();
    queryClient.invalidateQueries({
      queryKey: adminKeys.deletedThoughts(),
    });
    queryClient.invalidateQueries({ queryKey: thoughtKeys.all() });
    queryClient.invalidateQueries({ queryKey: adminKeys.thoughts() });
  };

  const restoreMutation = useMutation({
    mutationFn: restoreDeletedThought,
    onMutate: (id) => {
      setRestoringThoughtId(id);
    },
    onSuccess: handleInvalidate,
    onSettled: () => {
      setRestoringThoughtId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: permanentlyDeleteThought,
    onMutate: (id) => {
      setDeletingThoughtId(id);
    },
    onSuccess: () => {
      setPermanentlyDeletingThought(null);
      handleInvalidate();
    },
    onSettled: () => {
      setDeletingThoughtId(null);
    },
  });

  const handleConfirmPermanentDelete = (thought: DeletedThoughtFromServer) => {
    deleteMutation.mutate(thought.id);
  };

  return (
    <Tabs.Panel value="thoughts" className={classes.panel}>
      <div className={dashboardClasses.container}>
        <div className={dashboardClasses["table-container"]}>
          <Table.ScrollContainer minWidth="100%" maxHeight="100%">
            <Table highlightOnHover withColumnBorders withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Message</Table.Th>
                  <Table.Th>Created At</Table.Th>
                  <Table.Th>Deleted By</Table.Th>
                  <Table.Th>Deleted</Table.Th>
                  <Table.Th>Actions</Table.Th>
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
                      {formatDeletedByLabel(thought.deletedBy)}
                    </Table.Td>
                    <Table.Td>{formatDeletedDate(thought.deletedAt)}</Table.Td>
                    <Table.Td>
                      <ActionIcon.Group>
                        <Tooltip label="Recover thought">
                          <ActionIcon
                            aria-label="Recover thought"
                            variant="default"
                            onClick={() => {
                              if (canRestoreThought) {
                                setRestoringThought(thought);
                              }
                            }}
                            loading={
                              restoreMutation.isPending &&
                              restoringThoughtId === thought.id
                            }
                            disabled={
                              !canRestoreThought ||
                              (restoreMutation.isPending &&
                                restoringThoughtId === thought.id)
                            }
                          >
                            <IconArrowBackUp size="1em" />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Permanently delete thought">
                          <ActionIcon
                            aria-label="Permanently delete thought"
                            color="red"
                            onClick={() => {
                              if (canPermanentlyDeleteThought) {
                                setPermanentlyDeletingThought(thought);
                              }
                            }}
                            loading={
                              deleteMutation.isPending &&
                              deletingThoughtId === thought.id
                            }
                            disabled={
                              !canPermanentlyDeleteThought ||
                              (deleteMutation.isPending &&
                                deletingThoughtId === thought.id)
                            }
                          >
                            <IconTrashX size="1em" />
                          </ActionIcon>
                        </Tooltip>
                      </ActionIcon.Group>
                    </Table.Td>
                  </Table.Tr>
                ))}

                {isFetching ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} ta="center">
                      <Loader />
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  data?.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={6} ta="center">
                        No deleted thoughts found.
                      </Table.Td>
                    </Table.Tr>
                  )
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </div>

        <Pagination mt="md" value={page} onChange={setPage} total={total} />
      </div>

      {canPermanentlyDeleteThought && (
        <PermanentlyDeleteThoughtModal
          thought={permanentlyDeletingThought}
          opened={!!permanentlyDeletingThought}
          onClose={() => setPermanentlyDeletingThought(null)}
          onConfirm={handleConfirmPermanentDelete}
          loading={deleteMutation.isPending}
        />
      )}

      {canRestoreThought && (
        <RecoverThoughtModal
          thought={restoringThought}
          opened={!!restoringThought}
          onClose={() => setRestoringThought(null)}
          onConfirm={(thought) => {
            restoreMutation.mutate(thought.id);
            setRestoringThought(null);
          }}
          loading={
            restoreMutation.isPending &&
            restoringThoughtId === restoringThought?.id
          }
        />
      )}
    </Tabs.Panel>
  );
}
