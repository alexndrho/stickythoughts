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
  deletedLettersCountOptions,
  deletedLettersPageOptions,
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
import { deletedLettersOptions } from "@/app/dashboard/deleted/options";
import { letterBaseOptions } from "@/app/(main)/(core)/letters/options";
import type { DeletedLetterFromServer } from "@/types/deleted";
import {
  permanentlyDeleteLetter,
  restoreDeletedLetter,
} from "@/services/moderate/deleted";
import { formatUserDisplayName } from "@/utils/user";
import {
  PermanentlyDeleteLetterModal,
  RecoverLetterModal,
} from "./letter-modals";

export interface LettersTabProps {
  isActive: boolean;
}

export default function LettersTab({ isActive }: LettersTabProps) {
  const [page, setPage] = useState(1);
  const [permanentlyDeletingLetter, setPermanentlyDeletingLetter] =
    useState<DeletedLetterFromServer | null>(null);
  const [restoringLetter, setRestoringLetter] =
    useState<DeletedLetterFromServer | null>(null);
  const [restoringLetterId, setRestoringLetterId] = useState<string | null>(
    null,
  );
  const [deletingLetterId, setDeletingLetterId] = useState<string | null>(null);

  const { data: session } = authClient.useSession();
  const role = session?.user?.role;
  const isStaff = role === "admin" || role === "moderator";
  const canRestoreLetter = isStaff
    ? authClient.admin.checkRolePermission({
        role,
        permission: {
          letter: ["restore"],
        },
      })
    : false;
  const canPermanentlyDeleteLetter = isStaff
    ? authClient.admin.checkRolePermission({
        role,
        permission: {
          letter: ["purge"],
        },
      })
    : false;

  const { data, isFetching } = useQuery({
    ...deletedLettersPageOptions(page),
    enabled: isActive,
  });

  const { data: totalCount } = useQuery({
    ...deletedLettersCountOptions(),
    enabled: isActive,
  });

  const total = getPagedTotal(totalCount, ADMIN_DELETED_PER_PAGE);

  const handleInvalidate = () => {
    const queryClient = getQueryClient();
    queryClient.invalidateQueries({ queryKey: deletedLettersOptions.queryKey });
    queryClient.invalidateQueries({ queryKey: letterBaseOptions.queryKey });
  };

  const restoreMutation = useMutation({
    mutationFn: restoreDeletedLetter,
    onMutate: (id) => {
      setRestoringLetterId(id);
    },
    onSuccess: handleInvalidate,
    onSettled: () => {
      setRestoringLetterId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: permanentlyDeleteLetter,
    onMutate: (id) => {
      setDeletingLetterId(id);
    },
    onSuccess: () => {
      setPermanentlyDeletingLetter(null);
      handleInvalidate();
    },
    onSettled: () => {
      setDeletingLetterId(null);
    },
  });

  const handleConfirmPermanentDelete = (letter: DeletedLetterFromServer) => {
    deleteMutation.mutate(letter.id);
  };

  return (
    <Tabs.Panel value="letters" className={classes.panel}>
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
                {data?.map((letter) => (
                  <Table.Tr key={letter.id}>
                    <Table.Td>
                      <Text>{letter.title}</Text>
                    </Table.Td>
                    <Table.Td>{formatUserDisplayName(letter.author)}</Table.Td>
                    <Table.Td>
                      {letter.deletedById === letter.authorId ? (
                        <Badge size="sm">Author</Badge>
                      ) : (
                        formatDeletedByLabel(letter.deletedBy)
                      )}
                    </Table.Td>
                    <Table.Td>{formatDeletedDate(letter.deletedAt)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Recover letter">
                          <ActionIcon
                            aria-label="Recover letter"
                            variant="default"
                            onClick={() => {
                              if (canRestoreLetter) {
                                setRestoringLetter(letter);
                              }
                            }}
                            loading={
                              restoreMutation.isPending &&
                              restoringLetterId === letter.id
                            }
                            disabled={
                              !canRestoreLetter ||
                              (restoreMutation.isPending &&
                                restoringLetterId === letter.id)
                            }
                          >
                            <IconArrowBackUp size="1em" />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Permanently delete letter">
                          <ActionIcon
                            aria-label="Permanently delete letter"
                            color="red"
                            onClick={() => {
                              if (canPermanentlyDeleteLetter) {
                                setPermanentlyDeletingLetter(letter);
                              }
                            }}
                            loading={
                              deleteMutation.isPending &&
                              deletingLetterId === letter.id
                            }
                            disabled={
                              !canPermanentlyDeleteLetter ||
                              (deleteMutation.isPending &&
                                deletingLetterId === letter.id)
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
                        No deleted letters found.
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

      {canPermanentlyDeleteLetter && (
        <PermanentlyDeleteLetterModal
          letter={permanentlyDeletingLetter}
          opened={!!permanentlyDeletingLetter}
          onClose={() => setPermanentlyDeletingLetter(null)}
          onConfirm={handleConfirmPermanentDelete}
          loading={deleteMutation.isPending}
        />
      )}

      {canRestoreLetter && (
        <RecoverLetterModal
          letter={restoringLetter}
          opened={!!restoringLetter}
          onClose={() => setRestoringLetter(null)}
          onConfirm={(letter) => {
            restoreMutation.mutate(letter.id);
            setRestoringLetter(null);
          }}
          loading={
            restoreMutation.isPending &&
            restoringLetterId === restoringLetter?.id
          }
        />
      )}
    </Tabs.Panel>
  );
}
