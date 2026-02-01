"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ActionIcon,
  Badge,
  Group,
  Loader,
  Pagination,
  Table,
  Tabs,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconArrowBackUp, IconTrashX } from "@tabler/icons-react";

import { deletedThreadsCountOptions, deletedThreadsPageOptions } from "./options";
import { ADMIN_DELETED_PER_PAGE } from "@/config/admin";
import dashboardClasses from "../dashboard.module.css";
import classes from "./deleted.module.css";
import { formatDeletedByLabel, formatDeletedDate, getPagedTotal } from "./utils";
import { getQueryClient } from "@/lib/get-query-client";
import { deletedThreadsOptions } from "@/app/dashboard/deleted/options";
import { threadBaseOptions } from "@/app/(main)/(core)/threads/options";
import type { DeletedThreadFromServer } from "@/types/deleted";
import {
  permanentlyDeleteThread,
  restoreDeletedThread,
} from "@/services/moderate/deleted";
import { formatUserDisplayName } from "@/utils/user";
import {
  PermanentlyDeleteThreadModal,
  RecoverThreadModal,
} from "./thread-modals";

export interface ThreadsTabProps {
  isActive: boolean;
}

export default function ThreadsTab({ isActive }: ThreadsTabProps) {
  const [page, setPage] = useState(1);
  const [permanentlyDeletingThread, setPermanentlyDeletingThread] =
    useState<DeletedThreadFromServer | null>(null);
  const [restoringThread, setRestoringThread] =
    useState<DeletedThreadFromServer | null>(null);
  const [restoringThreadId, setRestoringThreadId] = useState<string | null>(
    null,
  );
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);

  const { data, isFetching } = useQuery({
    ...deletedThreadsPageOptions(page),
    enabled: isActive,
  });

  const { data: totalCount } = useQuery({
    ...deletedThreadsCountOptions(),
    enabled: isActive,
  });

  const total = getPagedTotal(totalCount, ADMIN_DELETED_PER_PAGE);

  const handleInvalidate = () => {
    const queryClient = getQueryClient();
    queryClient.invalidateQueries({ queryKey: deletedThreadsOptions.queryKey });
    queryClient.invalidateQueries({ queryKey: threadBaseOptions.queryKey });
  };

  const restoreMutation = useMutation({
    mutationFn: restoreDeletedThread,
    onMutate: (id) => {
      setRestoringThreadId(id);
    },
    onSuccess: handleInvalidate,
    onSettled: () => {
      setRestoringThreadId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: permanentlyDeleteThread,
    onMutate: (id) => {
      setDeletingThreadId(id);
    },
    onSuccess: () => {
      setPermanentlyDeletingThread(null);
      handleInvalidate();
    },
    onSettled: () => {
      setDeletingThreadId(null);
    },
  });

  const handleConfirmPermanentDelete = (thread: DeletedThreadFromServer) => {
    deleteMutation.mutate(thread.id);
  };

  return (
    <Tabs.Panel value="threads" className={classes.panel}>
      <div className={dashboardClasses.container}>
        <div className={dashboardClasses["table-container"]}>
          <Table.ScrollContainer minWidth="100%" maxHeight="100%">
            <Table highlightOnHover withColumnBorders withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Deleted By</Table.Th>
                  <Table.Th>Deleted</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {data?.map((thread) => (
                  <Table.Tr key={thread.id}>
                    <Table.Td>
                      <Text>{thread.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      {formatUserDisplayName(thread.author)}
                    </Table.Td>
                    <Table.Td>
                      {thread.deletedById === thread.authorId ? (
                        <Badge size="sm">Author</Badge>
                      ) : (
                        formatDeletedByLabel(thread.deletedBy)
                      )}
                    </Table.Td>
                    <Table.Td>{formatDeletedDate(thread.deletedAt)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Recover thread">
                          <ActionIcon
                            aria-label="Recover thread"
                            variant="default"
                            onClick={() => setRestoringThread(thread)}
                            loading={
                              restoreMutation.isPending &&
                              restoringThreadId === thread.id
                            }
                            disabled={
                              restoreMutation.isPending &&
                              restoringThreadId === thread.id
                            }
                          >
                            <IconArrowBackUp size="1em" />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Permanently delete thread">
                          <ActionIcon
                            aria-label="Permanently delete thread"
                            color="red"
                            onClick={() =>
                              setPermanentlyDeletingThread(thread)
                            }
                            loading={
                              deleteMutation.isPending &&
                              deletingThreadId === thread.id
                            }
                            disabled={
                              deleteMutation.isPending &&
                              deletingThreadId === thread.id
                            }
                          >
                            <IconTrashX size="1em" />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
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
                        No deleted threads found.
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

      <PermanentlyDeleteThreadModal
        thread={permanentlyDeletingThread}
        opened={!!permanentlyDeletingThread}
        onClose={() => setPermanentlyDeletingThread(null)}
        onConfirm={handleConfirmPermanentDelete}
        loading={deleteMutation.isPending}
      />

      <RecoverThreadModal
        thread={restoringThread}
        opened={!!restoringThread}
        onClose={() => setRestoringThread(null)}
        onConfirm={(thread) => {
          restoreMutation.mutate(thread.id);
          setRestoringThread(null);
        }}
        loading={
          restoreMutation.isPending &&
          restoringThreadId === restoringThread?.id
        }
      />
    </Tabs.Panel>
  );
}
