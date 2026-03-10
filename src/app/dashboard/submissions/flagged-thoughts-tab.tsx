'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ActionIcon, Loader, Table, Tabs, Text, Tooltip } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';

import { ADMIN_DELETED_PER_PAGE } from '@/config/admin';
import { authClient } from '@/lib/auth-client';
import { getQueryClient } from '@/lib/get-query-client';
import { adminKeys } from '@/lib/query-keys/admin';
import { thoughtKeys } from '@/lib/query-keys/thought';
import type { ModerationStatus } from '@/generated/prisma/client';
import { getFormattedDate } from '@/utils/date';
import { setSubmissionThoughtStatus } from '@/services/moderate/thought-submissions';
import PaginatedPanelLayout from '../paginated-panel-layout';
import classes from './submissions.module.css';
import { flaggedThoughtsCountOptions, flaggedThoughtsPageOptions } from './options';
import SubmittedThoughtPreviewModal from './submitted-thought-preview-modal';
import type { SubmissionThought } from '@/types/thought-submission';

export interface FlaggedThoughtsTabProps {
  isActive: boolean;
}

export default function FlaggedThoughtsTab({ isActive }: FlaggedThoughtsTabProps) {
  const [page, setPage] = useState(1);
  const [previewThought, setPreviewThought] = useState<SubmissionThought | null>(null);
  const [updatingThoughtId, setUpdatingThoughtId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<Extract<
    ModerationStatus,
    'APPROVED' | 'REJECTED'
  > | null>(null);

  const { data: session } = authClient.useSession();
  const role = session?.user?.role;
  const isStaff = role === 'admin' || role === 'moderator';
  const canSetStatus = isStaff
    ? authClient.admin.checkRolePermission({
        role,
        permission: {
          thought: ['review'],
        },
      })
    : false;

  const { data: thoughts, isFetching } = useQuery({
    ...flaggedThoughtsPageOptions(page),
    enabled: isActive,
  });

  const { data: totalCount } = useQuery({
    ...flaggedThoughtsCountOptions(),
    enabled: isActive,
  });

  const total = Math.max(1, Math.ceil((totalCount || 0) / ADMIN_DELETED_PER_PAGE));

  const mutation = useMutation({
    mutationFn: setSubmissionThoughtStatus,
    onMutate: ({ id, body }) => {
      setUpdatingThoughtId(id);
      setActionStatus(body.status);
    },
    onSuccess: () => {
      setPreviewThought(null);
      const queryClient = getQueryClient();
      queryClient.invalidateQueries({ queryKey: adminKeys.thoughtSubmissions() });
      queryClient.invalidateQueries({ queryKey: thoughtKeys.all() });
    },
    onSettled: () => {
      setUpdatingThoughtId(null);
      setActionStatus(null);
    },
  });

  return (
    <Tabs.Panel value="flagged" className={classes.panel}>
      <PaginatedPanelLayout page={page} onPageChange={setPage} total={total}>
        <Table.ScrollContainer minWidth="100%" maxHeight="100%">
          <Table highlightOnHover withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Author</Table.Th>
                <Table.Th>Message</Table.Th>
                <Table.Th>Submitted</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {thoughts?.map((thought) => (
                <Table.Tr key={thought.id}>
                  <Table.Td>
                    <Text lineClamp={1}>{thought.author}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text lineClamp={1}>{thought.message}</Text>
                  </Table.Td>
                  <Table.Td>
                    {thought.createdAt ? getFormattedDate(thought.createdAt) : '-'}
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label="Preview thought">
                      <ActionIcon
                        variant="default"
                        onClick={() => {
                          setPreviewThought(thought);
                        }}
                      >
                        <IconEye size="1em" />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}

              {isFetching ? (
                <Table.Tr>
                  <Table.Td colSpan={4} ta="center">
                    <Loader />
                  </Table.Td>
                </Table.Tr>
              ) : (
                thoughts?.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={4} ta="center">
                      No flagged thoughts found.
                    </Table.Td>
                  </Table.Tr>
                )
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </PaginatedPanelLayout>

      <SubmittedThoughtPreviewModal
        thought={previewThought}
        opened={!!previewThought}
        onClose={() => setPreviewThought(null)}
        canSetStatus={canSetStatus}
        onSetStatus={(thought, status) => {
          mutation.mutate({ id: thought.id, body: { status } });
        }}
        loading={mutation.isPending && updatingThoughtId === previewThought?.id}
        actionStatus={actionStatus}
      />
    </Tabs.Panel>
  );
}
