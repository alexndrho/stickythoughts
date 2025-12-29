"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Menu,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconEdit,
  IconPhoto,
  IconRosetteDiscountCheckFilled,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

import UploadProfilePictureModal from "./UploadProfilePictureModal";
import UpdateNameModal from "./UpdateNameModal";
import UpdateEmailModal from "./UpdateEmailModal";
import UpdateUsernameModal from "./UpdateUsernameModal";

import { authClient } from "@/lib/auth-client";
import { secondsToMinutesExtended } from "@/utils/date";
import { removeProfilePicture } from "@/services/user";
import { useTimer } from "@/hooks/use-timer";
import { userProfileOptions } from "./options";
import UpdateBioModal from "./UpdateBioModal";
import classes from "./settings.module.css";

export default function Content() {
  const router = useRouter();

  const {
    data: session,
    isPending: isSessionPending,
    refetch: refetchSession,
  } = authClient.useSession();

  const { data: userProfile, isLoading: isUserProfileLoading } =
    useQuery(userProfileOptions);

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push("/");
    }
  }, [isSessionPending, session, router]);

  const [
    uploadProfilePictureModalOpened,
    {
      open: openUploadProfilePictureModal,
      close: closeUploadProfilePictureModal,
    },
  ] = useDisclosure(false);

  const [timeLeftEmailVerification, startEmailVerificationTimer] = useTimer({
    duration: 3 * 60, // 3 minutes
  });

  const isEmailVerificationSent = timeLeftEmailVerification > 0;

  const [
    updateNameModalOpened,
    { open: openUpdateNameModal, close: closeUpdateNameModal },
  ] = useDisclosure(false);

  const [
    updateEmailModalOpened,
    { open: openUpdateEmailModal, close: closeUpdateEmailModal },
  ] = useDisclosure(false);

  const [
    updateUsernameModalOpened,
    { open: openUpdateUsernameModal, close: closeUpdateUsernameModal },
  ] = useDisclosure(false);

  const [
    updateBioModalOpened,
    { open: openUpdateBioModal, close: closeUpdateBioModal },
  ] = useDisclosure(false);

  const handleRemoveProfilePicture = async () => {
    await removeProfilePicture();
    refetchSession();
  };

  const emailVerificationMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("No session found");

      const response = await authClient.sendVerificationEmail({
        email: session.user.email,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
    },

    onSuccess: () => {
      startEmailVerificationTimer();

      notifications.show({
        title: "Verification Email Sent",
        message: "Please check your email to verify your email address.",
        color: "green",
        icon: <IconCheck />,
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
        icon: <IconX />,
      });
    },
  });

  const accountItems = [
    {
      label: "Name",
      value: session?.user?.name,
      loading: isSessionPending,
      rightSection: (
        <Button
          variant="default"
          size="compact-md"
          onClick={openUpdateNameModal}
        >
          Edit
        </Button>
      ),
    },
    {
      label: "Email",
      loading: isSessionPending,
      description: "This will not be shown to other users",
      value: (
        <>
          {session?.user?.email}

          {session?.user.emailVerified && (
            <IconRosetteDiscountCheckFilled color="var(--mantine-color-green-6)" />
          )}
        </>
      ),
      rightSection: (
        <>
          <Button
            variant="default"
            size="compact-md"
            onClick={openUpdateEmailModal}
          >
            Edit
          </Button>

          {!session?.user.emailVerified && (
            <Button
              size="compact-md"
              w={isEmailVerificationSent ? 53 : "auto"}
              disabled={isEmailVerificationSent}
              loading={emailVerificationMutation.isPending}
              onClick={() => emailVerificationMutation.mutate()}
            >
              {isEmailVerificationSent
                ? secondsToMinutesExtended(timeLeftEmailVerification)
                : "Verify"}
            </Button>
          )}
        </>
      ),
    },
    {
      label: "Username",
      value: session?.user?.username,
      loading: isSessionPending,
      rightSection: (
        <Button
          variant="default"
          size="compact-md"
          onClick={openUpdateUsernameModal}
        >
          Edit
        </Button>
      ),
    },
    {
      label: "Bio",
      value: userProfile?.bio,
      loading: isUserProfileLoading,
      rightSection: (
        <Button
          variant="default"
          size="compact-md"
          onClick={openUpdateBioModal}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Box className={classes.container}>
      <Title order={1} size="h2" className={classes.title}>
        Account
      </Title>

      <Divider mb="lg" />

      <div className={classes.content}>
        <div className={classes["user-info"]}>
          {accountItems.map((item, index) => (
            <div key={index} className={classes["user-info__account-item"]}>
              <div>
                <Text
                  size="lg"
                  truncate
                  className={classes["account-item__label"]}
                >
                  {item.label}
                </Text>

                {item.description && (
                  <Text
                    size="sm"
                    className={classes["account-item__description"]}
                  >
                    {item.description}
                  </Text>
                )}

                <Skeleton
                  visible={item.loading}
                  className={classes["account-item__skeleton-wrapper-value"]}
                >
                  <Text className={classes["account-item__value"]}>
                    {item.value || "No value set"}
                  </Text>
                </Skeleton>
              </div>

              <Skeleton w="auto" visible={item.loading}>
                <div className={classes["account-item__right-section"]}>
                  {item.rightSection}
                </div>
              </Skeleton>
            </div>
          ))}
        </div>

        <div className={classes["profile-picture-container"]}>
          <Avatar
            src={session?.user?.image}
            className={classes["profile-picture"]}
          />

          <Menu>
            <Menu.Target>
              <Button
                variant="default"
                className={classes["profile-picture-container__edit-button"]}
                size="compact-md"
                leftSection={<IconEdit size="1em" />}
              >
                Edit
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconPhoto size="1em" />}
                onClick={openUploadProfilePictureModal}
              >
                Upload a photo
              </Menu.Item>

              {session?.user?.image && (
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size="1em" />}
                  onClick={handleRemoveProfilePicture}
                >
                  Remove photo
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      <UploadProfilePictureModal
        opened={uploadProfilePictureModalOpened}
        onClose={closeUploadProfilePictureModal}
      />

      <UpdateNameModal
        defaultValue={session?.user?.name}
        opened={updateNameModalOpened}
        onClose={closeUpdateNameModal}
      />

      <UpdateEmailModal
        defaultValue={session?.user?.email}
        opened={updateEmailModalOpened}
        onClose={closeUpdateEmailModal}
        session={session}
      />

      <UpdateUsernameModal
        defaultValue={session?.user?.username ?? undefined}
        opened={updateUsernameModalOpened}
        onClose={closeUpdateUsernameModal}
      />

      <UpdateBioModal
        defaultValue={userProfile?.bio ?? undefined}
        opened={updateBioModalOpened}
        onClose={closeUpdateBioModal}
      />
    </Box>
  );
}
