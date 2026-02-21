'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ActionIcon, Badge, Loader, Table, Tabs, Text, Tooltip } from '@mantine/core';
import { IconArrowBackUp, IconTrashX } from '@tabler/icons-react';

import { deletedRepliesCountOptions, deletedRepliesPageOptions } from './options';
import { ADMIN_DELETED_PER_PAGE } from '@/config/admin';
import PaginatedPanelLayout from '../paginated-panel-layout';
import classes from './deleted.module.css';
import { formatDeletedByLabel, formatDeletedDate, getPagedTotal } from './utils';
import { authClient } from '@/lib/auth-client';
import { getQueryClient } from '@/lib/get-query-client';
import { adminKeys } from '@/lib/query-keys/admin';
import { letterKeys } from '@/lib/query-keys/letter';
import { permanentlyDeleteReply, restoreDeletedReply } from '@/services/moderate/deleted';
import { formatUserDisplayName } from '@/utils/user';
import { PermanentlyDeleteReplyModal, RecoverReplyModal } from './reply-modals';
import type { DeletedLetterReply } from '@/types/deleted';

export interface RepliesTabProps {
  isActive: boolean;
}

export default function RepliesTab({ isActive }: RepliesTabProps) {
  const [page, setPage] = useState(1);
  const [permanentlyDeletingReply, setPermanentlyDeletingReply] =
    useState<DeletedLetterReply | null>(null);
  const [restoringReply, setRestoringReply] = useState<DeletedLetterReply | null>(null);
  const [restoringReplyId, setRestoringReplyId] = useState<string | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  const { data: session } = authClient.useSession();
  const role = session?.user?.role;
  const isStaff = role === 'admin' || role === 'moderator';
  const canRestoreReply = isStaff
    ? authClient.admin.checkRolePermission({
        role,
        permission: {
          letterReply: ['restore'],
        },
      })
    : false;
  const canPermanentlyDeleteReply = isStaff
    ? authClient.admin.checkRolePermission({
        role,
        permission: {
          letterReply: ['purge'],
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
      queryKey: adminKeys.deletedReplies(),
    });
    queryClient.invalidateQueries({ queryKey: letterKeys.all() });
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

  const handleConfirmPermanentDelete = (reply: DeletedLetterReply) => {
    deleteMutation.mutate(reply.id);
  };

  return (
    <Tabs.Panel value="replies" className={classes.panel}>
      <PaginatedPanelLayout page={page} onPageChange={setPage} total={total}>
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
                    <Text lineClamp={2}>{reply.body}</Text>
                  </Table.Td>
                  <Table.Td>{formatUserDisplayName(reply.author)}</Table.Td>
                  <Table.Td>
                    <Text lineClamp={1}>{reply.letter.recipient}</Text>
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
                    <ActionIcon.Group>
                      <Tooltip label="Recover reply">
                        <ActionIcon
                          aria-label="Recover reply"
                          variant="default"
                          onClick={() => {
                            if (canRestoreReply) {
                              setRestoringReply(reply);
                            }
                          }}
                          loading={restoreMutation.isPending && restoringReplyId === reply.id}
                          disabled={
                            !canRestoreReply ||
                            (restoreMutation.isPending && restoringReplyId === reply.id)
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
                          loading={deleteMutation.isPending && deletingReplyId === reply.id}
                          disabled={
                            !canPermanentlyDeleteReply ||
                            (deleteMutation.isPending && deletingReplyId === reply.id)
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
                      No deleted replies found.
                    </Table.Td>
                  </Table.Tr>
                )
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </PaginatedPanelLayout>

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
          loading={restoreMutation.isPending && restoringReplyId === restoringReply?.id}
        />
      )}
    </Tabs.Panel>
  );
}
