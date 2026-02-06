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

import {
  deletedRepliesCountOptions,
  deletedRepliesPageOptions,
} from "./options";
import { ADMIN_DELETED_PER_PAGE } from "@/config/admin";
import dashboardClasses from "../dashboard.module.css";
import classes from "./deleted.module.css";
import {
  formatDeletedByLabel,
  formatDeletedDate,
  getPagedTotal,
} from "./utils";
import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { deletedRepliesOptions } from "@/app/dashboard/deleted/options";
import { letterBaseOptions } from "@/app/(main)/(core)/letters/options";
import type { DeletedLetterReplyFromServer } from "@/types/deleted";
import {
  permanentlyDeleteReply,
  restoreDeletedReply,
} from "@/services/moderate/deleted";
import { stripHtmlTags } from "@/utils/text";
import { formatUserDisplayName } from "@/utils/user";
import { PermanentlyDeleteReplyModal, RecoverReplyModal } from "./reply-modals";

export interface RepliesTabProps {
  isActive: boolean;
}

export default function RepliesTab({ isActive }: RepliesTabProps) {
  const [page, setPage] = useState(1);
  const [permanentlyDeletingReply, setPermanentlyDeletingReply] =
    useState<DeletedLetterReplyFromServer | null>(null);
  const [restoringReply, setRestoringReply] =
    useState<DeletedLetterReplyFromServer | null>(null);
  const [restoringReplyId, setRestoringReplyId] = useState<string | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  const { data: session } = authClient.useSession();
  const role = session?.user?.role;
  const isStaff = role === "admin" || role === "moderator";
  const canRestoreReply = isStaff
    ? authClient.admin.checkRolePermission({
        role,
        permission: {
          letterReply: ["restore"],
        },
      })
    : false;
  const canPermanentlyDeleteReply = isStaff
    ? authClient.admin.checkRolePermission({
        role,
        permission: {
          letterReply: ["purge"],
        },
      })
    : false;

  const { data, isFetching } = useQuery({
    ...deletedRepliesPageOptions(page),
    enabled: isActive,
  });

  const { data: totalCount } = useQuery({
    ...deletedRepliesCountOptions(),
    enabled: isActive,
  });

  const total = getPagedTotal(totalCount, ADMIN_DELETED_PER_PAGE);

  const handleInvalidate = () => {
    const queryClient = getQueryClient();
    queryClient.invalidateQueries({
      queryKey: deletedRepliesOptions.queryKey,
    });
    queryClient.invalidateQueries({ queryKey: letterBaseOptions.queryKey });
  };

  const restoreMutation = useMutation({
    mutationFn: restoreDeletedReply,
    onMutate: (id) => {
      setRestoringReplyId(id);
    },
    onSuccess: handleInvalidate,
    onSettled: () => {
      setRestoringReplyId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: permanentlyDeleteReply,
    onMutate: (id) => {
      setDeletingReplyId(id);
    },
    onSuccess: () => {
      setPermanentlyDeletingReply(null);
      handleInvalidate();
    },
    onSettled: () => {
      setDeletingReplyId(null);
    },
  });

  const handleConfirmPermanentDelete = (
    reply: DeletedLetterReplyFromServer,
  ) => {
    deleteMutation.mutate(reply.id);
  };

  return (
    <Tabs.Panel value="replies" className={classes.panel}>
      <div className={dashboardClasses.container}>
        <div className={dashboardClasses["table-container"]}>
          <Table.ScrollContainer minWidth="100%" maxHeight="100%">
            <Table highlightOnHover withColumnBorders withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Reply</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Letter</Table.Th>
                  <Table.Th>Deleted By</Table.Th>
                  <Table.Th>Deleted</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {data?.map((reply) => (
                  <Table.Tr key={reply.id}>
                    <Table.Td>
                      <Text lineClamp={2}>{stripHtmlTags(reply.body)}</Text>
                    </Table.Td>
                    <Table.Td>{formatUserDisplayName(reply.author)}</Table.Td>
                    <Table.Td>
                      <Text lineClamp={1}>{reply.letter.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      {reply.deletedById === reply.authorId ? (
                        <Badge size="sm">Author</Badge>
                      ) : (
                        formatDeletedByLabel(reply.deletedBy)
                      )}
                    </Table.Td>
                    <Table.Td>{formatDeletedDate(reply.deletedAt)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Recover reply">
                          <ActionIcon
                            aria-label="Recover reply"
                            variant="default"
                            onClick={() => {
                              if (canRestoreReply) {
                                setRestoringReply(reply);
                              }
                            }}
                            loading={
                              restoreMutation.isPending &&
                              restoringReplyId === reply.id
                            }
                            disabled={
                              !canRestoreReply ||
                              (restoreMutation.isPending &&
                                restoringReplyId === reply.id)
                            }
                          >
                            <IconArrowBackUp size="1em" />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Permanently delete reply">
                          <ActionIcon
                            aria-label="Permanently delete reply"
                            color="red"
                            onClick={() => {
                              if (canPermanentlyDeleteReply) {
                                setPermanentlyDeletingReply(reply);
                              }
                            }}
                            loading={
                              deleteMutation.isPending &&
                              deletingReplyId === reply.id
                            }
                            disabled={
                              !canPermanentlyDeleteReply ||
                              (deleteMutation.isPending &&
                                deletingReplyId === reply.id)
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
                    <Table.Td colSpan={6} ta="center">
                      <Loader />
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  data?.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={6} ta="center">
                        No deleted replies found.
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

      {canPermanentlyDeleteReply && (
        <PermanentlyDeleteReplyModal
          reply={permanentlyDeletingReply}
          opened={!!permanentlyDeletingReply}
          onClose={() => setPermanentlyDeletingReply(null)}
          onConfirm={handleConfirmPermanentDelete}
          loading={deleteMutation.isPending}
        />
      )}

      {canRestoreReply && (
        <RecoverReplyModal
          reply={restoringReply}
          opened={!!restoringReply}
          onClose={() => setRestoringReply(null)}
          onConfirm={(reply) => {
            restoreMutation.mutate(reply.id);
            setRestoringReply(null);
          }}
          loading={
            restoreMutation.isPending && restoringReplyId === restoringReply?.id
          }
        />
      )}
    </Tabs.Panel>
  );
}
