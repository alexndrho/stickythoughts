"use client";

import { useEffect, useEffectEvent } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { IconEdit } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { adminUsersOptions } from "./options";
import { userUsernameOptions } from "../(main)/(core)/user/options";
import TextInputLabelModifiedIndicator from "@/components/TextInputLabelModifiedIndicator";

export interface EditUserModalProps {
  user: {
    id: string;
    name?: string;
    username: string;
    email?: string;
  } | null;
  onUsernameChange?: (newUsername: string) => void;
  opened: boolean;
  onClose: () => void;
}

export default function EditUserModal({
  user,
  onUsernameChange,
  opened,
  onClose,
}: EditUserModalProps) {
  const form = useForm({
    initialValues: {
      name: undefined as string | undefined,
      username: undefined as string | undefined,
      email: undefined as string | undefined,
    },
  });

  const setForm = useEffectEvent((user: EditUserModalProps["user"]) => {
    form.setInitialValues({
      name: user?.name,
      username: user?.username,
      email: user?.email,
    });

    form.reset();
  });

  useEffect(() => {
    setForm(user);
  }, [user]);

  const editUserMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: typeof form.values }) =>
      authClient.admin.updateUser({
        userId: id,
        data: {
          name: values.name,
          email: values.email,
          username: values.username,
          // role: values.role,
        },
      }),
    onSuccess: ({ error }) => {
      if (error) {
        if (error.message) {
          form.setFieldError(
            "root",
            error.message || "An unknown error occurred.",
          );
        }

        return;
      }

      const queryClient = getQueryClient();

      queryClient.invalidateQueries({
        queryKey: adminUsersOptions.queryKey,
      });

      if (
        form.values.username &&
        user?.username &&
        form.values.username !== user.username
      ) {
        queryClient.invalidateQueries({
          queryKey: userUsernameOptions(user.username).queryKey,
          refetchType: "none",
        });

        onUsernameChange?.(form.values.username);
      } else if (user?.username) {
        queryClient.invalidateQueries({
          queryKey: userUsernameOptions(user.username).queryKey,
        });
      }

      onClose();
      notifications.show({
        title: "User Updated",
        message: "The user has been successfully updated.",
        icon: <IconEdit size="1em" />,
      });
    },
  });

  return (
    <Modal title="Edit User" opened={opened} onClose={onClose} centered>
      {user ? (
        <form
          onSubmit={form.onSubmit((values) =>
            editUserMutation.mutate({ id: user.id, values }),
          )}
        >
          <TextInput
            label={
              <TextInputLabelModifiedIndicator
                label="Name"
                modified={form.isDirty("name")}
              />
            }
            placeholder={user.name}
            {...form.getInputProps("name")}
          />

          <TextInput
            mt="md"
            label={
              <TextInputLabelModifiedIndicator
                label="Username"
                modified={form.isDirty("username")}
              />
            }
            placeholder={user.username}
            {...form.getInputProps("username")}
          />

          {user.email && (
            <TextInput
              mt="md"
              label={
                <TextInputLabelModifiedIndicator
                  label="Email"
                  modified={form.isDirty("email")}
                />
              }
              placeholder={user.email}
              {...form.getInputProps("email")}
            />
          )}

          {/* <Select
            mt="md"
            allowDeselect={false}
            label={
              <TextInputLabelModifiedIndicator
                label="Role"
                modified={form.isDirty("role")}
              />
            }
            data={[
              { value: "user", label: "User" },
              { value: "moderator", label: "Moderator" },
              { value: "admin", label: "Admin" },
            ]}
            value={form.values.role}
            onChange={(value) => form.setFieldValue("role", value || undefined)}
          /> */}

          {form.errors.root && (
            <Text mt="xs" size="xs" c="red">
              {form.errors.root}
            </Text>
          )}

          <Group mt="md" justify="end">
            <Button
              type="submit"
              disabled={!form.isDirty()}
              loading={editUserMutation.isPending}
            >
              Save Changes
            </Button>
          </Group>
        </form>
      ) : (
        <p>No user selected.</p>
      )}
    </Modal>
  );
}
