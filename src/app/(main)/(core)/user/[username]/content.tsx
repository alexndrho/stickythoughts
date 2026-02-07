"use client";

import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import {
  ActionIcon,
  Avatar,
  Badge,
  CopyButton,
  Menu,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import {
  IconClipboard,
  IconClock,
  IconDots,
  IconEdit,
  IconFaceId,
  IconHammer,
  IconHammerOff,
  IconHeart,
  IconHeartOff,
  IconId,
  IconMail,
  IconMessageCircle,
  IconPhoto,
} from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { userUsernameOptions } from "../options";
import LettersTab from "./letters-tab";
import LikesTab from "./likes-tab";
import RepliesTab from "./replies-tab";
import SignInWarningModal from "@/components/sign-in-warning-modal";
import EditUserModal from "@/app/dashboard/users/edit-user-modal";
import DeleteUserProfilePictureModal from "@/app/dashboard/users/delete-user-profile-picture-modal";
import DeleteUserBioModal from "@/app/dashboard/users/delete-user-bio-modal";
import RevokeUserSessionsModal from "@/app/dashboard/users/revoke-user-sessions-modal";
import BanUserModal from "@/app/dashboard/users/ban-user-modal";
import UnbanUserModal from "@/app/dashboard/users/unban-user-modal";
import { notifications } from "@mantine/notifications";
import classes from "./user.module.css";

export interface ContentProps {
  username: string;
}

type AdminCheckParams = Parameters<
  typeof authClient.admin.checkRolePermission
>[0];
type AdminPermissions = NonNullable<
  Extract<AdminCheckParams, { permissions: unknown }>["permissions"]
>;

const hasAdminPermission = (
  role: AdminCheckParams["role"] | undefined,
  permissions: AdminPermissions,
) => {
  if (!role) return false;
  return authClient.admin.checkRolePermission({ role, permissions });
};

export default function Content({ username }: ContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = authClient.useSession();

  const [signInWarningModalOpened, signInWarningModalHandler] =
    useDisclosure(false);
  const [editUserModalOpened, editUserModalHandler] = useDisclosure(false);
  const [
    deleteUserProfilePictureModalOpened,
    deleteUserProfilePictureModalHandler,
  ] = useDisclosure(false);
  const [deleteUserBioModalOpened, deleteUserBioModalHandler] =
    useDisclosure(false);
  const [revokeUserSessionsModalOpened, revokeUserSessionsModalHandler] =
    useDisclosure(false);
  const [banUserModalOpened, banUserModalHandler] = useDisclosure(false);
  const [unbanUserModalOpened, unbanUserModalHandler] = useDisclosure(false);

  const { data: user } = useSuspenseQuery(userUsernameOptions(username));

  const currentTab = useMemo(() => {
    const tab = searchParams.get("tab");
    if (tab === "letters" || tab === "replies" || tab === "likes") return tab;
    return "letters";
  }, [searchParams]);

  const setTab = (value: string | null) => {
    const next = value ?? "letters";
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const role = session?.data?.user.role;
  const isOwner = session?.data?.user.username === user.username;
  const isStaff = role === "admin" || role === "moderator";

  const canUpdateUser = isStaff
    ? hasAdminPermission(role, { user: ["update"] })
    : false;
  const canBanUser = isStaff
    ? hasAdminPermission(role, { user: ["ban"] })
    : false;
  const canRevokeSessions = isStaff
    ? hasAdminPermission(role, { session: ["revoke"] })
    : false;

  const canEditOtherUser = !isOwner && canUpdateUser;
  const canRevokeOtherUserSessions = !isOwner && canRevokeSessions;
  const canBanOtherUser = !isOwner && canBanUser;
  const canManageUser =
    canEditOtherUser || canBanOtherUser || canRevokeOtherUserSessions;

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <div className={classes.header__info}>
          <Avatar size="xl" src={user.image} />

          <div className={classes.header__details}>
            {user.name ? (
              <>
                <div className={classes.header__nameRow}>
                  <Title size="h2">{user.name || user.username}</Title>
                  {isStaff && user.banned && (
                    <Badge color="red" size="sm">
                      Banned
                    </Badge>
                  )}
                </div>

                <Text size="lg">@{user.username}</Text>
              </>
            ) : (
              <div className={classes.header__nameRow}>
                <Title size="h2">@{user.username}</Title>
                {isStaff && user.banned && (
                  <Badge color="red" size="sm">
                    Banned
                  </Badge>
                )}
              </div>
            )}

            {user.bio && (
              <Text size="sm" className={classes.header__bio}>
                {user.bio}
              </Text>
            )}
          </div>
        </div>

        {(isOwner || canManageUser) && (
          <Menu>
            <Menu.Target>
              <ActionIcon variant="default" aria-label="User actions">
                <IconDots size="1em" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {(isOwner || canEditOtherUser) && (
                <Menu.Item
                  leftSection={<IconEdit size="1em" />}
                  onClick={() => {
                    if (canEditOtherUser) {
                      editUserModalHandler.open();
                    } else {
                      router.push("/settings");
                    }
                  }}
                >
                  Edit
                </Menu.Item>
              )}

              {canEditOtherUser && (
                <>
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
                    onClick={deleteUserProfilePictureModalHandler.open}
                  >
                    Delete Profile Picture
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconFaceId size="1em" />}
                    color="red"
                    disabled={!user.bio}
                    onClick={deleteUserBioModalHandler.open}
                  >
                    Delete Bio
                  </Menu.Item>
                </>
              )}

              {canRevokeOtherUserSessions && (
                <Menu.Item
                  color="red"
                  leftSection={<IconClock size="1em" />}
                  onClick={revokeUserSessionsModalHandler.open}
                >
                  Revoke Sessions
                </Menu.Item>
              )}

              {canBanOtherUser &&
                (!user.banned ? (
                  <Menu.Item
                    color="red"
                    leftSection={<IconHammer size="1em" />}
                    onClick={banUserModalHandler.open}
                  >
                    Ban
                  </Menu.Item>
                ) : (
                  <Menu.Item
                    color="red"
                    leftSection={<IconHammerOff size="1em" />}
                    onClick={unbanUserModalHandler.open}
                  >
                    Unban
                  </Menu.Item>
                ))}
            </Menu.Dropdown>
          </Menu>
        )}
      </header>

      <Tabs
        variant="outline"
        value={currentTab}
        onChange={setTab}
        className={classes["tab-root"]}
      >
        <Tabs.List>
          <Tabs.Tab value="letters" leftSection={<IconMail size="1em" />}>
            Letters
          </Tabs.Tab>

          <Tabs.Tab
            value="replies"
            leftSection={<IconMessageCircle size="1em" />}
          >
            Replies
          </Tabs.Tab>

          <Tabs.Tab
            value="likes"
            leftSection={
              user.isLikesPrivate ? (
                <IconHeartOff size="1em" />
              ) : (
                <IconHeart size="1em" />
              )
            }
          >
            Likes
          </Tabs.Tab>
        </Tabs.List>

        <LettersTab
          username={user.username}
          session={session.data}
          isActive={currentTab === "letters"}
          openSignInWarningModal={signInWarningModalHandler.open}
        />

        <RepliesTab
          username={user.username}
          session={session.data}
          isActive={currentTab === "replies"}
          openSignInWarningModal={signInWarningModalHandler.open}
        />

        <LikesTab
          username={user.username}
          session={session}
          isPrivate={user.isLikesPrivate}
          isActive={currentTab === "likes"}
          openSignInWarningModal={signInWarningModalHandler.open}
        />
      </Tabs>

      {!session && (
        <SignInWarningModal
          opened={signInWarningModalOpened}
          onClose={signInWarningModalHandler.close}
        />
      )}

      {canEditOtherUser && (
        <>
          <EditUserModal
            user={{
              id: user.id,
              name: user.name,
              username: user.username,
            }}
            onUsernameChange={(newUsername) =>
              router.replace(`/user/${newUsername.toLowerCase()}`)
            }
            opened={editUserModalOpened}
            onClose={editUserModalHandler.close}
          />

          <DeleteUserProfilePictureModal
            user={{
              id: user.id,
              username: user.username,
            }}
            opened={deleteUserProfilePictureModalOpened}
            onClose={deleteUserProfilePictureModalHandler.close}
          />

          <DeleteUserBioModal
            user={{
              id: user.id,
              username: user.username,
            }}
            opened={deleteUserBioModalOpened}
            onClose={deleteUserBioModalHandler.close}
          />
        </>
      )}

      {canRevokeOtherUserSessions && (
        <RevokeUserSessionsModal
          user={{
            id: user.id,
            username: user.username,
          }}
          opened={revokeUserSessionsModalOpened}
          onClose={revokeUserSessionsModalHandler.close}
        />
      )}

      {canBanOtherUser && (
        <>
          <BanUserModal
            user={{
              id: user.id,
              username: user.username,
            }}
            opened={banUserModalOpened}
            onClose={banUserModalHandler.close}
          />

          <UnbanUserModal
            user={{
              id: user.id,
              username: user.username,
            }}
            opened={unbanUserModalOpened}
            onClose={unbanUserModalHandler.close}
          />
        </>
      )}
    </div>
  );
}
