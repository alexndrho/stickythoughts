"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ActionIcon,
  Loader,
  Pagination,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

import { adminThoughtsPageOptions } from "@/app/dashboard/thoughts/options";
import { ADMIN_THOUGHTS_PER_PAGE } from "@/config/admin";
import { thoughtCountOptions } from "@/app/(main)/options";
import dashboardClasses from "./dashboard.module.css";
import DeleteThoughtModal from "./delete-thought-modal";
import type { PublicThoughtPayload } from "@/utils/thought";

export default function Content() {
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery(adminThoughtsPageOptions(page));

  const { data: count } = useQuery(thoughtCountOptions);

  const [deletingThought, setDeletingThought] =
    useState<PublicThoughtPayload | null>(null);

  const handleOpenDeleteModal = (thought: PublicThoughtPayload) => {
    setDeletingThought(thought);
  };

  const handleCloseDeleteModal = () => {
    setDeletingThought(null);
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

                  <Table.Td>
                    <ActionIcon
                      aria-label="Delete Thought"
                      color="red"
                      onClick={() => handleOpenDeleteModal(thought)}
                    >
                      <IconTrash size="1em" />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}

              {isFetching ? (
                <Table.Tr>
                  <Table.Td colSpan={3} ta="center">
                    <Loader />
                  </Table.Td>
                </Table.Tr>
              ) : (
                data?.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={3} ta="center">
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
    </div>
  );
}
