"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { type UserWithRole } from "better-auth/plugins";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { IconHammer } from "@tabler/icons-react";
import {
  addDays,
  differenceInCalendarDays,
  differenceInSeconds,
} from "date-fns";

import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { adminUsersOptions } from "./options";

export interface BanUserModalProps {
  user: UserWithRole | null;
  opened: boolean;
  onClose: () => void;
}

export default function BanUserModal({
  user,
  opened,
  onClose,
}: BanUserModalProps) {
  const [areYouSure, setAreYouSure] = useState(false);

  const form = useForm({
    initialValues: {
      banReason: "",
      banExpiresIn: null as Date | null,
    },
    onValuesChange: () => {
      setAreYouSure(false);
    },
  });

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) => {
      const now = new Date();
      const banExpiresIn = values.banExpiresIn
        ? differenceInSeconds(
            addDays(now, differenceInCalendarDays(values.banExpiresIn, now)),
            now,
          )
        : undefined;

      return authClient.admin.banUser({
        userId: user?.id,
        banReason: values.banReason,
        banExpiresIn,
      });
    },
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

      handleClose();

      notifications.show({
        title: "User Banned",
        // @ts-expect-error - username exists but not in UserWithRole type
        message: `@${user?.username} has been successfully banned.`,
        icon: <IconHammer size="1em" />,
      });
    },
  });

  const formReset = useEffectEvent(() => {
    form.reset();
  });

  useEffect(() => {
    formReset();
  }, [user]);

  const handleClose = () => {
    setAreYouSure(false);
    onClose();
  };

  return (
    <Modal
      // @ts-expect-error - username exists but not in UserWithRole type
      title={`Ban @${user?.username}?`}
      opened={opened}
      onClose={handleClose}
      centered
    >
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <TextInput
          label="Ban Reason"
          description="Optional reason for banning this user"
          placeholder="Enter the reason for banning this user"
          {...form.getInputProps("banReason")}
        />

        <DatePickerInput
          mt="md"
          label="Ban Expires On"
          description="Leave empty for a permanent ban (expires at current time)"
          placeholder="Select ban expiration date"
          clearable
          minDate={new Date()}
          {...form.getInputProps("banExpiresIn")}
        />

        {form.errors.root && (
          <Text mt="xs" size="xs" c="red">
            {form.errors.root}
          </Text>
        )}

        <Group mt="md" justify="end">
          <Button
            color="red"
            type="submit"
            onClick={(e) => {
              if (!areYouSure) {
                e.preventDefault();
                setAreYouSure(true);
                return;
              }
            }}
            loading={mutation.isPending}
          >
            {areYouSure ? "Are you sure?" : "Ban User"}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
