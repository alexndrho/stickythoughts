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

import { deletedCommentsCountOptions, deletedCommentsPageOptions } from "./options";
import { ADMIN_DELETED_PER_PAGE } from "@/config/admin";
import dashboardClasses from "../dashboard.module.css";
import classes from "./deleted.module.css";
import {
  formatDeletedByLabel,
  formatDeletedDate,
  getPagedTotal,
} from "./utils";
import { getQueryClient } from "@/lib/get-query-client";
import { deletedCommentsOptions } from "@/app/dashboard/deleted/options";
import { threadBaseOptions } from "@/app/(main)/(core)/threads/options";
import type { DeletedThreadCommentFromServer } from "@/types/deleted";
import {
  permanentlyDeleteComment,
  restoreDeletedComment,
} from "@/services/moderate/deleted";
import { stripHtmlTags } from "@/utils/text";
import {
  PermanentlyDeleteCommentModal,
  RecoverCommentModal,
} from "./comment-modals";

export interface CommentsTabProps {
  isActive: boolean;
}

export default function CommentsTab({ isActive }: CommentsTabProps) {
  const [page, setPage] = useState(1);
  const [permanentlyDeletingComment, setPermanentlyDeletingComment] =
    useState<DeletedThreadCommentFromServer | null>(null);
  const [restoringComment, setRestoringComment] =
    useState<DeletedThreadCommentFromServer | null>(null);
  const [restoringCommentId, setRestoringCommentId] = useState<string | null>(
    null,
  );
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  const { data, isFetching } = useQuery({
    ...deletedCommentsPageOptions(page),
    enabled: isActive,
  });

  const { data: totalCount } = useQuery({
    ...deletedCommentsCountOptions(),
    enabled: isActive,
  });

  const total = getPagedTotal(totalCount, ADMIN_DELETED_PER_PAGE);

  const handleInvalidate = () => {
    const queryClient = getQueryClient();
    queryClient.invalidateQueries({
      queryKey: deletedCommentsOptions.queryKey,
    });
    queryClient.invalidateQueries({ queryKey: threadBaseOptions.queryKey });
  };

  const restoreMutation = useMutation({
    mutationFn: restoreDeletedComment,
    onMutate: (id) => {
      setRestoringCommentId(id);
    },
    onSuccess: handleInvalidate,
    onSettled: () => {
      setRestoringCommentId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: permanentlyDeleteComment,
    onMutate: (id) => {
      setDeletingCommentId(id);
    },
    onSuccess: () => {
      setPermanentlyDeletingComment(null);
      handleInvalidate();
    },
    onSettled: () => {
      setDeletingCommentId(null);
    },
  });

  const handleConfirmPermanentDelete = (
    comment: DeletedThreadCommentFromServer,
  ) => {
    deleteMutation.mutate(comment.id);
  };

  return (
    <Tabs.Panel value="comments" className={classes.panel}>
      <div className={dashboardClasses.container}>
        <div className={dashboardClasses["table-container"]}>
          <Table.ScrollContainer minWidth="100%" maxHeight="100%">
            <Table highlightOnHover withColumnBorders withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Comment</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Thread</Table.Th>
                  <Table.Th>Deleted By</Table.Th>
                  <Table.Th>Deleted</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {data?.map((comment) => (
                  <Table.Tr key={comment.id}>
                    <Table.Td>
                      <Text lineClamp={2}>{stripHtmlTags(comment.body)}</Text>
                    </Table.Td>
                    <Table.Td>
                      {comment.author.name
                        ? `${comment.author.name} (@${comment.author.username})`
                        : `@${comment.author.username}`}
                    </Table.Td>
                    <Table.Td>
                      <Text lineClamp={1}>{comment.thread.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      {comment.deletedById === comment.authorId ? (
                        <Badge size="sm">Author</Badge>
                      ) : (
                        formatDeletedByLabel(comment.deletedBy)
                      )}
                    </Table.Td>
                    <Table.Td>{formatDeletedDate(comment.deletedAt)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Recover comment">
                          <ActionIcon
                            aria-label="Recover comment"
                            variant="default"
                            onClick={() => setRestoringComment(comment)}
                            loading={
                              restoreMutation.isPending &&
                              restoringCommentId === comment.id
                            }
                            disabled={
                              restoreMutation.isPending &&
                              restoringCommentId === comment.id
                            }
                          >
                            <IconArrowBackUp size="1em" />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Permanently delete comment">
                          <ActionIcon
                            aria-label="Permanently delete comment"
                            color="red"
                            onClick={() =>
                              setPermanentlyDeletingComment(comment)
                            }
                            loading={
                              deleteMutation.isPending &&
                              deletingCommentId === comment.id
                            }
                            disabled={
                              deleteMutation.isPending &&
                              deletingCommentId === comment.id
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
                        No deleted comments found.
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

      <PermanentlyDeleteCommentModal
        comment={permanentlyDeletingComment}
        opened={!!permanentlyDeletingComment}
        onClose={() => setPermanentlyDeletingComment(null)}
        onConfirm={handleConfirmPermanentDelete}
        loading={deleteMutation.isPending}
      />

      <RecoverCommentModal
        comment={restoringComment}
        opened={!!restoringComment}
        onClose={() => setRestoringComment(null)}
        onConfirm={(comment) => {
          restoreMutation.mutate(comment.id);
          setRestoringComment(null);
        }}
        loading={
          restoreMutation.isPending &&
          restoringCommentId === restoringComment?.id
        }
      />
    </Tabs.Panel>
  );
}
