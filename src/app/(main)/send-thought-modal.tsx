"use client";

import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Group,
  Modal,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { notifications } from "@mantine/notifications";
import { IconMessage } from "@tabler/icons-react";

import RandomButton from "@/components/random-button";
import CheckColorSwatch from "@/components/check-color-swatch";
import { getQueryClient } from "@/lib/get-query-client";
import { thoughtKeys } from "@/lib/query-keys";
import { submitThought } from "@/services/thought";
import { createThoughtInput } from "@/lib/validations/thought";
import {
  THOUGHT_MAX_AUTHOR_LENGTH,
  THOUGHT_MAX_MESSAGE_LENGTH,
  THOUGHT_COLORS,
} from "@/config/thought";
import classes from "./home.module.css";
import ServerError from "@/utils/error/ServerError";

export interface SendThoughtModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SendThoughtModal({
  open,
  onClose,
}: SendThoughtModalProps) {
  const form = useForm({
    initialValues: {
      message: "",
      author:
        typeof window !== "undefined"
          ? localStorage.getItem("author") || ""
          : "",
      color: THOUGHT_COLORS[0] as (typeof THOUGHT_COLORS)[number],
    },
    validate: zod4Resolver(createThoughtInput),
  });

  const handleRandomColor = () => {
    // Get all colors except the current one.
    const colors = THOUGHT_COLORS.filter(
      (color) => color !== form.values.color,
    );

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    form.setFieldValue("color", randomColor);
  };

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      const response = await submitThought({
        ...values,
      });

      return { response, formValues: values };
    },
    onError: (error) => {
      if (error instanceof ServerError) {
        form.setFieldError("root", error.issues[0].message);

        return;
      } else {
        console.error(error);
        notifications.show({
          title: "Failed to submit thought",
          message: "An error occurred while submitting your thought.",
          color: "red",
        });
      }
    },
    onSuccess: ({ formValues }) => {
      localStorage.setItem("author", formValues.author);
      form.setInitialValues({
        message: "",
        author: formValues.author,
        color: THOUGHT_COLORS[0],
      });

      getQueryClient().invalidateQueries({
        queryKey: thoughtKeys.infinite(),
      });

      getQueryClient().invalidateQueries({
        queryKey: thoughtKeys.all(),
      });

      notifications.show({
        title: "Thought submitted!",
        message: "Your thought has been successfully submitted.",
        color: `${form.values.color}.6`,
        icon: <IconMessage size="1em" />,
      });

      onClose();
      form.reset();
    },
  });

  return (
    <Modal opened={open} onClose={onClose} title="Share a thought" centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <Textarea
          label="Message"
          withAsterisk
          rows={5}
          maxLength={THOUGHT_MAX_MESSAGE_LENGTH}
          disabled={mutation.isPending}
          rightSection={
            THOUGHT_MAX_MESSAGE_LENGTH - form.values.message.length <= 10 && (
              <Text
                size="sm"
                className={
                  classes["send-thought-modal__message-length-indicator"]
                }
              >
                {THOUGHT_MAX_MESSAGE_LENGTH - form.values.message.length}
              </Text>
            )
          }
          {...form.getInputProps("message")}
          className={classes["send-thought-modal__text-input"]}
        />

        <TextInput
          label="Author"
          withAsterisk
          maxLength={THOUGHT_MAX_AUTHOR_LENGTH}
          disabled={mutation.isPending}
          leftSection={"\u2013"}
          rightSection={
            THOUGHT_MAX_AUTHOR_LENGTH - form.values.author.length <= 5 && (
              <Text
                size="sm"
                className={
                  classes["send-thought-modal__message-length-indicator"]
                }
              >
                {THOUGHT_MAX_AUTHOR_LENGTH - form.values.author.length}
              </Text>
            )
          }
          {...form.getInputProps("author")}
          className={classes["send-thought-modal__text-input"]}
        />

        {form.errors.root && (
          <Text
            size="xs"
            className={classes["send-thought-modal__root-error-messsage"]}
          >
            {form.errors.root}
          </Text>
        )}

        <Group mt="md" justify="center">
          <Tooltip label="Randomize color" position="left">
            <RandomButton onClick={handleRandomColor} />
          </Tooltip>

          {THOUGHT_COLORS.map((color) => (
            <CheckColorSwatch
              key={color}
              color={color}
              onClick={() => form.setFieldValue("color", color)}
              checked={form.values.color === color}
              disabled={mutation.isPending}
            />
          ))}
        </Group>

        <Group justify="right" mt="md">
          <Button type="submit" loading={mutation.isPending}>
            Stick it!
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
