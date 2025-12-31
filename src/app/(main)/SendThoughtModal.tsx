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

import RandomButton from "@/components/RandomButton";
import CheckColorSwatch from "@/components/CheckColorSwatch";
import { getQueryClient } from "@/lib/get-query-client";
import { thoughtInfiniteOptions, thoughtOptions } from "@/app/(main)/options";
import { submitThought } from "@/services/thought";
import { createThoughtInput } from "@/lib/validations/thought";
import {
  THOUGHT_MAX_AUTHOR_LENGTH,
  THOUGHT_MAX_MESSAGE_LENGTH,
  THOUGHT_COLORS,
} from "@/config/thought";
import classes from "./home.module.css";

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
      console.error(error);

      notifications.show({
        title: "Failed to submit thought",
        message: "An error occurred while submitting your thought.",
        color: "red",
      });
    },
    onSuccess: ({ formValues }) => {
      localStorage.setItem("author", formValues.author);
      form.setInitialValues({
        message: "",
        author: formValues.author,
        color: THOUGHT_COLORS[0],
      });

      getQueryClient().invalidateQueries({
        queryKey: thoughtInfiniteOptions.queryKey,
      });

      getQueryClient().invalidateQueries({
        queryKey: thoughtOptions.queryKey,
      });

      notifications.show({
        title: "Thought submitted!",
        message: "Your thought has been successfully submitted.",
        color: `${form.values.color}.6`,
      });
      onClose();
      form.reset();
    },
  });

  return (
    <Modal opened={open} onClose={onClose} title="Share a thought" centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <TextInput
          label="Author"
          withAsterisk
          maxLength={THOUGHT_MAX_AUTHOR_LENGTH}
          disabled={mutation.isPending}
          {...form.getInputProps("author")}
          className={classes["send-thought-modal__text-input"]}
        />

        <Textarea
          label="Message"
          withAsterisk
          rows={5}
          maxLength={THOUGHT_MAX_MESSAGE_LENGTH}
          disabled={mutation.isPending}
          {...form.getInputProps("message")}
          className={classes["send-thought-modal__text-input"]}
        />

        <Text
          size="sm"
          c={
            form.values.message.length >= THOUGHT_MAX_MESSAGE_LENGTH
              ? "red"
              : undefined
          }
          className={classes["send-thought-modal__message-length-indicator"]}
        >{`${form.values.message.length}/${THOUGHT_MAX_MESSAGE_LENGTH}`}</Text>

        <Group justify="center">
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
