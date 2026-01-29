"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type UserWithRole } from "better-auth/plugins";
import { notifications } from "@mantine/notifications";
import {
  ActionIcon,
  Avatar,
  Badge,
  CopyButton,
  Group,
  Input,
  Loader,
  Menu,
  Pagination,
  Select,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  IconClipboard,
  IconClock,
  IconDots,
  IconEdit,
  IconHammer,
  IconHammerOff,
  IconId,
  IconPhoto,
  IconRosetteDiscountCheckFilled,
  IconSearch,
} from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { ADMIN_USERS_PER_PAGE } from "@/config/admin";
import { adminUsersPageOptions } from "./options";
import EditUserModal from "./edit-user-modal";
import DeleteUserProfilePictureModal from "./delete-user-profile-picture-modal";
import RevokeUserSessionsModal from "./revoke-user-sessions-modal";
import BanUserModal from "./ban-user-modal";
import UnbanUserModal from "./unban-user-modal";
import dashboardClasses from "./dashboard.module.css";
import classes from "./user.module.css";
import { useDebouncedValue } from "@mantine/hooks";

export default function Content() {
  const { data: session } = authClient.useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc" | "default"
  >("default");

  const [debouncedSearch] = useDebouncedValue(search, 300);

  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [deletingUserProfilePicture, setDeletingUserProfilePicture] =
    useState<UserWithRole | null>(null);
  const [banningUser, setBanningUser] = useState<UserWithRole | null>(null);
  const [revokingSessionsUser, setRevokingSessionsUser] =
    useState<UserWithRole | null>(null);
  const [unbanningUser, setUnbanningUser] = useState<UserWithRole | null>(null);

  const { data: results, isFetching } = useQuery(
    adminUsersPageOptions({
      page,
      search: debouncedSearch || undefined,
      sortDirection: sortDirection === "default" ? undefined : sortDirection,
    }),
  );

  const handleOpenEditUserModal = (user: UserWithRole) => {
    setEditingUser(user);
  };

  const handleCloseEditUserModal = () => {
    setEditingUser(null);
  };

  const handleOpenDeleteUserProfilePictureModal = (user: UserWithRole) => {
    setDeletingUserProfilePicture(user);
  };

  const handleCloseDeleteUserProfilePictureModal = () => {
    setDeletingUserProfilePicture(null);
  };

  const handleOpenBanUserModal = (user: UserWithRole) => {
    setBanningUser(user);
  };

  const handleCloseBanUserModal = () => {
    setBanningUser(null);
  };

  const handleOpenUnbanUserModal = (user: UserWithRole) => {
    setUnbanningUser(user);
  };

  const handleCloseUnbanUserModal = () => {
    setUnbanningUser(null);
  };

  // permissions
  const hasPermissionToUpdateUsers = session?.user.role === "admin";

  return (
    <div className={dashboardClasses.container}>
      <Title className={dashboardClasses.title}>Users</Title>

      <Group mb="md" justify="end">
        <Input
          placeholder="Search users..."
          leftSection={<IconSearch size="1em" />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />

        <Select
          data={[
            { value: "default", label: "Default" },
            { value: "desc", label: "Newest First" },
            { value: "asc", label: "Oldest First" },
          ]}
          defaultValue="default"
          value={sortDirection}
          onChange={(value) =>
            setSortDirection((value as "asc" | "desc" | "default") || "default")
          }
        />
      </Group>

      <div className={dashboardClasses["table-container"]}>
        <Table.ScrollContainer minWidth="100%" maxHeight="100%">
          <Table highlightOnHover withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Banned</Table.Th>
                <Table.Th>Ban Reason</Table.Th>
                <Table.Th>Ban Expires</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {results?.data?.users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <div className={classes["table__td-user-container"]}>
                      <Avatar src={user.image} />

                      <div>
                        {user.name ? (
                          <>
                            <Text fw="bold">{user.name}</Text>

                            <Text size="sm" c="dimmed">
                              {/* @ts-expect-error - username exists but not in UserWithRole type */}
                              @{user.username}
                            </Text>
                          </>
                        ) : (
                          <Text fw="bold">
                            {/* @ts-expect-error - username exists but not in UserWithRole type */}
                            @{user.username}
                          </Text>
                        )}
                      </div>
                    </div>
                  </Table.Td>

                  <Table.Td>
                    <div className={classes["table__td-email-container"]}>
                      {user.email}{" "}
                      {user.emailVerified && (
                        <IconRosetteDiscountCheckFilled
                          className={classes["table__td-email-verified-icon"]}
                        />
                      )}
                    </div>
                  </Table.Td>

                  <Table.Td>
                    <Badge color={user.role === "admin" ? "blue" : "gray"}>
                      {user.role || "user"}
                    </Badge>
                  </Table.Td>

                  <Table.Td>{user.banned ? "Yes" : "No"}</Table.Td>

                  <Table.Td>{user.banReason || "-"}</Table.Td>

                  <Table.Td>
                    {user.banExpires
                      ? new Date(user.banExpires).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })
                      : "-"}
                  </Table.Td>

                  <Table.Td>
                    {session?.user?.id !== user.id && (
                      <Menu>
                        <Menu.Target>
                          <ActionIcon
                            variant="default"
                            aria-label="Open user actions menu"
                          >
                            <IconDots size="1em" />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          {hasPermissionToUpdateUsers && (
                            <Menu.Item
                              leftSection={<IconEdit size="1em" />}
                              onClick={() => handleOpenEditUserModal(user)}
                            >
                              Edit
                            </Menu.Item>
                          )}
                          <CopyButton value={user.id}>
                            {({ copy }) => (
                              <Menu.Item
                                leftSection={<IconId size="1em" />}
                                onClick={() => {
                                  copy();

                                  notifications.show({
                                    title: "User ID Copied",
                                    message:
                                      "The user ID has been copied to your clipboard.",
                                    icon: <IconClipboard size="1em" />,
                                  });
                                }}
                              >
                                Copy ID
                              </Menu.Item>
                            )}
                          </CopyButton>

                          <Menu.Divider />

                          <Menu.Item
                            leftSection={<IconPhoto size="1em" />}
                            color="red"
                            disabled={!user.image}
                            onClick={() =>
                              handleOpenDeleteUserProfilePictureModal(user)
                            }
                          >
                            Delete Profile Picture
                          </Menu.Item>

                          <Menu.Item
                            color="red"
                            leftSection={<IconClock size="1em" />}
                            onClick={() => setRevokingSessionsUser(user)}
                          >
                            Revoke Sessions
                          </Menu.Item>

                          {user.banned ? (
                            <Menu.Item
                              leftSection={<IconHammerOff size="1em" />}
                              color="red"
                              onClick={() => handleOpenUnbanUserModal(user)}
                            >
                              Unban
                            </Menu.Item>
                          ) : (
                            <Menu.Item
                              leftSection={<IconHammer size="1em" />}
                              color="red"
                              onClick={() => handleOpenBanUserModal(user)}
                            >
                              Ban
                            </Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}

              {isFetching ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: "center" }}>
                    <Loader />
                  </Table.Td>
                </Table.Tr>
              ) : (
                results?.data?.users.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={7} style={{ textAlign: "center" }}>
                      No users found.
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
        total={Math.ceil((results?.data?.total || 0) / ADMIN_USERS_PER_PAGE)}
      />

      <EditUserModal
        user={
          editingUser
            ? {
                id: editingUser.id,
                name: editingUser.name,
                // @ts-expect-error - username exists but not in UserWithRole type
                username: editingUser.username,
                email: editingUser.email,
              }
            : null
        }
        opened={!!editingUser}
        onClose={handleCloseEditUserModal}
      />

      <DeleteUserProfilePictureModal
        user={
          deletingUserProfilePicture
            ? {
                id: deletingUserProfilePicture.id,
                // @ts-expect-error - username exists but not in UserWithRole type
                username: deletingUserProfilePicture.username,
              }
            : null
        }
        opened={!!deletingUserProfilePicture}
        onClose={handleCloseDeleteUserProfilePictureModal}
      />

      <RevokeUserSessionsModal
        user={
          revokingSessionsUser
            ? {
                id: revokingSessionsUser.id,
                // @ts-expect-error - username exists but not in UserWithRole type
                username: revokingSessionsUser.username,
              }
            : null
        }
        opened={!!revokingSessionsUser}
        onClose={() => setRevokingSessionsUser(null)}
      />

      <BanUserModal
        user={
          banningUser
            ? {
                id: banningUser.id,
                // @ts-expect-error - username exists but not in UserWithRole type
                username: banningUser.username,
              }
            : null
        }
        opened={!!banningUser}
        onClose={handleCloseBanUserModal}
      />

      <UnbanUserModal
        user={
          unbanningUser
            ? {
                id: unbanningUser.id,
                // @ts-expect-error - username exists but not in UserWithRole type
                username: unbanningUser.username,
              }
            : null
        }
        opened={!!unbanningUser}
        onClose={handleCloseUnbanUserModal}
      />
    </div>
  );
}
