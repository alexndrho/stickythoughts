import { useMutation } from "@tanstack/react-query";
import { matchesField, useForm } from "@mantine/form";
import { Button, Group, Modal, PasswordInput } from "@mantine/core";

import { authClient } from "@/lib/auth-client";

export interface UpdateNameModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function UpdatePasswordModal({
  opened,
  onClose,
}: UpdateNameModalProps) {
  const form = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validate: {
      confirmNewPassword: matchesField(
        "newPassword",
        "New Password does not match",
      ),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      }),
    onSuccess: ({ error }) => {
      if (!error) {
        onClose();
        form.reset();
      } else {
        if (error.code === "INVALID_PASSWORD") {
          form.setFieldError("currentPassword", error.message);
        } else if (error.code === "PASSWORD_TOO_SHORT") {
          form.setErrors({
            newPassword: error.message,
            confirmNewPassword: error.message,
          });
        } else if (error.code === "PASSWORD_TOO_LONG") {
          form.setErrors({
            newPassword: error.message,
            confirmNewPassword: error.message,
          });
        } else if (error.message) {
          form.setErrors({ currentPassword: error.message });
        } else {
          form.setErrors({
            currentPassword: "An unexpected error occurred. Please try again.",
          });
        }
      }
    },
  });

  return (
    <Modal title="Update Password" opened={opened} onClose={onClose} centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <PasswordInput
          label="Current Password"
          type="password"
          required
          {...form.getInputProps("currentPassword")}
        />

        <PasswordInput
          mt="md"
          label="New Password"
          type="password"
          required
          {...form.getInputProps("newPassword")}
        />

        <PasswordInput
          mt="md"
          label="Confirm New Password"
          type="password"
          required
          {...form.getInputProps("confirmNewPassword")}
        />

        <Group mt="md" justify="end">
          <Button type="submit" loading={mutation.isPending}>
            Update Password
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
