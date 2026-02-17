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

import { ADMIN_DELETED_PER_PAGE } from "@/config/admin";
import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { adminKeys, letterKeys } from "@/lib/query-keys";
import type { LetterStatus } from "@/generated/prisma/client";
import type { SubmissionLetterFromServer } from "@/types/submission";
import { getFormattedDate } from "@/utils/date";
import { formatUserDisplayName } from "@/utils/user";
import { setSubmissionLetterStatus } from "@/services/moderate/submissions";
import dashboardClasses from "../dashboard.module.css";
import classes from "./submissions.module.css";
import {
  submittedLettersCountOptions,
  submittedLettersPageOptions,
} from "./options";
import SubmittedLetterPreviewModal from "./submitted-letter-preview-modal";
import { IconEye } from "@tabler/icons-react";

export interface SubmittedLettersTabProps {
  isActive: boolean;
}

export default function SubmittedLettersTab({
  isActive,
}: SubmittedLettersTabProps) {
  const [page, setPage] = useState(1);
  const [previewLetter, setPreviewLetter] =
    useState<SubmissionLetterFromServer | null>(null);
  const [updatingLetterId, setUpdatingLetterId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<Extract<
    LetterStatus,
    "APPROVED" | "REJECTED"
  > | null>(null);

  const { data: session } = authClient.useSession();
  const role = session?.user?.role;
  const isStaff = role === "admin" || role === "moderator";
  const canSetStatus = isStaff
    ? authClient.admin.checkRolePermission({
        role,
        permission: {
          letter: ["review"],
        },
      })
    : false;

  const { data: letters, isFetching } = useQuery({
    ...submittedLettersPageOptions(page),
    enabled: isActive,
  });

  const { data: totalCount } = useQuery({
    ...submittedLettersCountOptions(),
    enabled: isActive,
  });

  const total = Math.max(
    1,
    Math.ceil((totalCount || 0) / ADMIN_DELETED_PER_PAGE),
  );

  const mutation = useMutation({
    mutationFn: setSubmissionLetterStatus,
    onMutate: ({ id, status }) => {
      setUpdatingLetterId(id);
      setActionStatus(status);
    },
    onSuccess: () => {
      setPreviewLetter(null);
      const queryClient = getQueryClient();
      queryClient.invalidateQueries({ queryKey: adminKeys.submissions() });
      queryClient.invalidateQueries({ queryKey: letterKeys.all() });
    },
    onSettled: () => {
      setUpdatingLetterId(null);
      setActionStatus(null);
    },
  });

  return (
    <Tabs.Panel value="submitted" className={classes.panel}>
      <div className={dashboardClasses.container}>
        <div className={dashboardClasses["table-container"]}>
          <Table.ScrollContainer minWidth="100%" maxHeight="100%">
            <Table highlightOnHover withColumnBorders withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Submitted</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {letters?.map((letter) => (
                  <Table.Tr key={letter.id}>
                    <Table.Td>
                      <Text lineClamp={1}>{letter.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      {!letter.author || letter.isAnonymous
                        ? "Anonymous"
                        : formatUserDisplayName(letter.author)}
                    </Table.Td>
                    <Table.Td>
                      {letter.createdAt
                        ? getFormattedDate(letter.createdAt)
                        : "-"}
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label="Preview letter">
                        <ActionIcon
                          variant="default"
                          onClick={() => {
                            setPreviewLetter(letter);
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
                  letters?.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={4} ta="center">
                        No submitted letters found.
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

      <SubmittedLetterPreviewModal
        letter={previewLetter}
        opened={!!previewLetter}
        onClose={() => setPreviewLetter(null)}
        canSetStatus={canSetStatus}
        onSetStatus={(letter, status) => {
          mutation.mutate({ id: letter.id, status });
        }}
        loading={mutation.isPending && updatingLetterId === previewLetter?.id}
        actionStatus={actionStatus}
      />
    </Tabs.Panel>
  );
}
