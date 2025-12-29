"use client";

import Link from "next/link";
import {
  Anchor,
  Box,
  Button,
  Center,
  Group,
  TextInput,
  Title,
} from "@mantine/core";
import { isEmail, useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { IconArrowLeft } from "@tabler/icons-react";

import { AuthContainer } from "../AuthContainer";
import { authClient } from "@/lib/auth-client";
import classes from "./forgot-password.module.css";

export interface StepOneProps {
  setEmail: (email: string) => void;
  nextStep: () => void;
}

export default function StepOne({ setEmail, nextStep }: StepOneProps) {
  const sendOTPForm = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: isEmail("Invalid email"),
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: async (values: typeof sendOTPForm.values) => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "forget-password",
      });

      if (data?.success) {
        setEmail(values.email);
        nextStep();
      } else if (error) {
        sendOTPForm.setFieldError("email", error.message);
      } else {
        sendOTPForm.setFieldError("email", "Failed to send verification code");
      }
    },
    onError: () => {
      sendOTPForm.setFieldError("email", "Failed to send verification code");
    },
  });

  return (
    <Center>
      <AuthContainer>
        <form
          onSubmit={sendOTPForm.onSubmit((values) =>
            sendOTPMutation.mutate(values),
          )}
        >
          <Title order={2} className={classes["paper-title"]}>
            Enter your email
          </Title>

          <TextInput
            label="Your email"
            placeholder="me@example.com"
            withAsterisk
            {...sendOTPForm.getInputProps("email")}
          />

          <Group mt="md" justify="space-between">
            <Anchor component={Link} href="/sign-in" c="dimmed" size="sm">
              <Center inline>
                <IconArrowLeft size={12} stroke={1.5} />
                <Box ml={5}>Back to the login page</Box>
              </Center>
            </Anchor>

            <Button type="submit" loading={sendOTPMutation.isPending}>
              Reset password
            </Button>
          </Group>
        </form>
      </AuthContainer>
    </Center>
  );
}
