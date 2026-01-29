"use client";

import { useEffect, useEffectEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { isEmail, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Button, Group, Modal, TextInput } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { secondsToMinutesExtended } from "@/utils/date";
import { useTimer } from "@/hooks/use-timer";

export interface UpdateEmailModalProps {
  opened: boolean;
  onClose: () => void;
  defaultValue?: string;
  session: ReturnType<typeof authClient.useSession>["data"];
}

export default function UpdateEmailModal({
  opened,
  onClose,
  defaultValue,
  session,
}: UpdateEmailModalProps) {
  const form = useForm({
    initialValues: {
      email: defaultValue || "",
    },
    validate: {
      email: isEmail("Invalid email address"),
    },
  });

  const setFormEmail = useEffectEvent((email?: string) => {
    form.setInitialValues({ email: email || "" });
    form.setValues({ email: email || "" });
  });

  useEffect(() => {
    setFormEmail(defaultValue);
  }, [defaultValue]);

  const [timerLeft, start] = useTimer({
    duration: 3 * 60, // 3 minutes
  });

  const isEmailUpdateVerificationSent = timerLeft > 0;

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      const response = await authClient.changeEmail({
        newEmail: values.email,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response;
    },
    onSuccess: () => {
      start();
      form.reset();
      onClose();

      if (session?.user) {
        if (!session.user.emailVerified) {
          notifications.show({
            title: "Email Updated",
            message: "Your email has been successfully updated.",
            color: "green",
            icon: <IconCheck />,
          });
        } else {
          notifications.show({
            title: "Email Update Requested",
            message: "Please check your new email to approve the email change.",
            color: "green",
            icon: <IconCheck />,
          });
        }
      }
    },
    onError: (error) => {
      form.setFieldError("email", error.message);
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Update email" centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <Group align="end">
          <TextInput
            flex={1}
            label="Email"
            placeholder={defaultValue || "Enter your email"}
            withAsterisk
            {...form.getInputProps("email")}
          />

          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!form.values.email || isEmailUpdateVerificationSent}
          >
            {isEmailUpdateVerificationSent
              ? secondsToMinutesExtended(timerLeft)
              : "Update"}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
