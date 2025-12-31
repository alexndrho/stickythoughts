"use client";

import { useEffect, useEffectEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { Button, Group, Modal, Text, Textarea } from "@mantine/core";

import { updateUserBioInput } from "@/lib/validations/user";
import { updateUserBio } from "@/services/user";
import { getQueryClient } from "@/lib/get-query-client";
import { userOptions } from "../user/options";
import ServerError from "@/utils/error/ServerError";
import { USER_BIO_MAX_LENGTH } from "@/config/user";

export interface UpdateEmailModalProps {
  opened: boolean;
  onClose: () => void;
  defaultValue?: string;
}

export default function UpdateBioModal({
  opened,
  onClose,
  defaultValue,
}: UpdateEmailModalProps) {
  const form = useForm({
    initialValues: {
      bio: defaultValue || "",
    },
    validate: zod4Resolver(updateUserBioInput),
  });

  const setFormBio = useEffectEvent((bio?: string) => {
    form.setInitialValues({ bio: bio || "" });
    form.setValues({ bio: bio || "" });
  });

  useEffect(() => {
    setFormBio(defaultValue);
  }, [defaultValue]);

  const mutation = useMutation({
    mutationFn: updateUserBio,
    onSuccess: () => {
      const queryClient = getQueryClient();
      queryClient.invalidateQueries({ queryKey: userOptions.queryKey });

      onClose();
      form.reset();
    },
    onError: (error) => {
      if (error instanceof ServerError) {
        form.setErrors({ bio: error.issues[0].message });
      } else {
        form.setErrors({
          bio: "An unexpected error occurred. Please try again.",
        });
      }
    },
  });

  return (
    <Modal title="Update Bio" opened={opened} onClose={onClose} centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values.bio))}>
        <Textarea
          label="Bio"
          placeholder="Enter your bio"
          rows={3}
          maxLength={USER_BIO_MAX_LENGTH}
          disabled={mutation.isPending}
          {...form.getInputProps("bio")}
        />

        <Text
          size="sm"
          ta="right"
          c={form.values.bio.length >= USER_BIO_MAX_LENGTH ? "red" : ""}
        >{`${form.values.bio.length}/${USER_BIO_MAX_LENGTH}`}</Text>

        <Group mt="md" justify="end">
          <Button type="submit" loading={mutation.isPending}>
            Update
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
