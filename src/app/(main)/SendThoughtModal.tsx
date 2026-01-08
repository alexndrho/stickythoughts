"use client";

import { useEffect, useEffectEvent, useRef } from "react";
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
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { notifications } from "@mantine/notifications";

import RandomButton from "@/components/RandomButton";
import CheckColorSwatch from "@/components/CheckColorSwatch";
import { getQueryClient } from "@/lib/get-query-client";
import { thoughtsInfiniteOptions, thoughtsOptions } from "@/app/(main)/options";
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
  const turnstileRef = useRef<TurnstileInstance>(null);

  const form = useForm({
    initialValues: {
      message: "",
      author:
        typeof window !== "undefined"
          ? localStorage.getItem("author") || ""
          : "",
      color: THOUGHT_COLORS[0] as (typeof THOUGHT_COLORS)[number],
      turnstileToken: "",
    },
    validate: zod4Resolver(createThoughtInput),
  });

  const resetTurnstile = () => {
    form.setFieldValue("turnstileToken", "");
    turnstileRef.current?.reset();
  };

  const resetTurnstileEffectEvent = useEffectEvent(() => {
    resetTurnstile();
  });

  useEffect(() => {
    if (!open) {
      resetTurnstileEffectEvent();
    }
  }, [open]);

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

      resetTurnstile();
    },
    onSuccess: ({ formValues }) => {
      localStorage.setItem("author", formValues.author);
      form.setInitialValues({
        message: "",
        author: formValues.author,
        color: THOUGHT_COLORS[0],
        turnstileToken: "",
      });

      getQueryClient().invalidateQueries({
        queryKey: thoughtsInfiniteOptions.queryKey,
      });

      getQueryClient().invalidateQueries({
        queryKey: thoughtsOptions.queryKey,
      });

      notifications.show({
        title: "Thought submitted!",
        message: "Your thought has been successfully submitted.",
        color: `${form.values.color}.6`,
      });

      resetTurnstile();
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

        <Turnstile
          ref={turnstileRef}
          siteKey={
            process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_THOUGHT_KEY!
          }
          className={classes["send-thought-modal__captcha"]}
          onSuccess={(token) => form.setFieldValue("turnstileToken", token)}
          onExpire={() => turnstileRef.current?.reset()}
          onError={() =>
            form.setFieldError("turnstileToken", "Captcha verification failed")
          }
        />

        {(form.errors.root || form.errors.turnstileToken) && (
          <Text
            size="xs"
            className={classes["send-thought-modal__root-error-messsage"]}
          >
            {form.errors.root || form.errors.turnstileToken}
          </Text>
        )}

        <Group justify="right" mt="md">
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={form.values.turnstileToken === ""}
          >
            Stick it!
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
