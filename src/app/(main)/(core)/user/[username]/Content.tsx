"use client";

import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import {
  ActionIcon,
  Avatar,
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
  IconHammer,
  IconHammerOff,
  IconHeart,
  IconHeartOff,
  IconId,
  IconMessage,
  IconMessageCircle,
  IconPhoto,
} from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { userUsernameOptions } from "../options";
import ThreadsTab from "./ThreadsTab";
import LikesTab from "./LikesTab";
import CommentsTab from "./CommentsTab";
import SignInWarningModal from "@/components/SignInWarningModal";
import EditUserModal from "@/app/dashboard/EditUserModal";
import DeleteUserProfilePictureModal from "@/app/dashboard/DeleteUserProfilePictureModal";
import RevokeUserSessionsModal from "@/app/dashboard/RevokeUserSessionsModal";
import BanUserModal from "@/app/dashboard/BanUserModal";
import UnbanUserModal from "@/app/dashboard/UnbanUserModal";
import { notifications } from "@mantine/notifications";
import classes from "./user.module.css";

export interface ContentProps {
  username: string;
}

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
  const [revokeUserSessionsModalOpened, revokeUserSessionsModalHandler] =
    useDisclosure(false);
  const [banUserModalOpened, banUserModalHandler] = useDisclosure(false);
  const [unbanUserModalOpened, unbanUserModalHandler] = useDisclosure(false);

  const { data: user } = useSuspenseQuery(userUsernameOptions(username));

  const currentTab = useMemo(() => {
    const tab = searchParams.get("tab");
    if (tab === "threads" || tab === "comments" || tab === "likes") return tab;
    return "threads";
  }, [searchParams]);

  const setTab = (value: string | null) => {
    const next = value ?? "threads";
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const isOwner = session?.data?.user.username === user.username;
  const hasPermission = session?.data?.user.role === "admin";
  const canManageUser = hasPermission && !isOwner;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.header__info}>
          <Avatar size="xl" src={user.image} />

          <div className={classes.header__details}>
            {user.name ? (
              <>
                <Title size="h2">{user.name || user.username}</Title>

                <Text size="lg">@{user.username}</Text>
              </>
            ) : (
              <Title size="h2">@{user.username}</Title>
            )}

            {user.bio && (
              <Text size="sm" className={classes.header__bio}>
                {user.bio}
              </Text>
            )}
          </div>
        </div>

        {(isOwner || hasPermission) && (
          <Menu>
            <Menu.Target>
              <ActionIcon variant="default" aria-label="User actions">
                <IconDots size="1em" />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size="1em" />}
                onClick={() => {
                  if (canManageUser) {
                    editUserModalHandler.open();
                  } else {
                    router.push("/settings");
                  }
                }}
              >
                Edit
              </Menu.Item>

              {canManageUser && (
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
                    color="red"
                    leftSection={<IconClock size="1em" />}
                    onClick={revokeUserSessionsModalHandler.open}
                  >
                    Revoke Sessions
                  </Menu.Item>

                  {!user.banned ? (
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
                  )}
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </div>

      <Tabs
        variant="outline"
        value={currentTab}
        onChange={setTab}
        className={classes["tab-root"]}
      >
        <Tabs.List>
          <Tabs.Tab value="threads" leftSection={<IconMessage size="1em" />}>
            Threads
          </Tabs.Tab>

          <Tabs.Tab
            value="comments"
            leftSection={<IconMessageCircle size="1em" />}
          >
            Comments
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

        <ThreadsTab
          username={user.username}
          session={session.data}
          isActive={currentTab === "threads"}
          openSignInWarningModal={signInWarningModalHandler.open}
        />

        <CommentsTab
          username={user.username}
          session={session.data}
          isActive={currentTab === "comments"}
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

      {canManageUser && (
        <>
          <EditUserModal
            user={{
              id: user.id,
              name: user.name,
              username: user.username,
            }}
            onUsernameChange={(newUsername) =>
              router.replace(`/user/${newUsername}`)
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

          <RevokeUserSessionsModal
            user={{
              id: user.id,
              username: user.username,
            }}
            opened={revokeUserSessionsModalOpened}
            onClose={revokeUserSessionsModalHandler.close}
          />

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
