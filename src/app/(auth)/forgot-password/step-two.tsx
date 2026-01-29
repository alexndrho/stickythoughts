"use client";

import { useEffect } from "react";
import { Button, Center, Group, PinInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

import { AuthContainer } from "../auth-container";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import classes from "./forgot-password.module.css";

export interface StepTwoProps {
  email: string | null;
  setVerificationCode: (code: string) => void;
  nextStep: () => void;
  resetStep: () => void;
}

export default function StepTwo({
  email,
  setVerificationCode,
  nextStep,
  resetStep,
}: StepTwoProps) {
  useEffect(() => {
    if (!email) {
      resetStep();
    }
  }, [email, resetStep]);

  const checkVerificationCodeForm = useForm({
    initialValues: {
      code: "",
    },
    validate: {
      code: (value) => (value.length === 6 ? null : "Code must be 6 digits"),
    },
  });

  const checkVerificationOtpMutation = useMutation({
    mutationFn: async ({ otp }: { otp: string }) => {
      if (!email) {
        checkVerificationCodeForm.setFieldError("code", "Email is required");
        return;
      }

      const { data, error } = await authClient.emailOtp.checkVerificationOtp({
        email,
        type: "forget-password",
        otp,
      });

      if (data?.success) {
        setVerificationCode(otp);
        nextStep();
      } else if (error) {
        checkVerificationCodeForm.setFieldError("code", error.message);
      } else {
        checkVerificationCodeForm.setFieldError(
          "code",
          "Invalid verification code",
        );
      }
    },
    onError: () => {
      checkVerificationCodeForm.setFieldError(
        "code",
        "Invalid verification code",
      );
    },
  });

  return (
    <Center>
      <AuthContainer>
        <Title order={2} className={classes["paper-title"]}>
          Enter the verification code
        </Title>

        <form
          onSubmit={checkVerificationCodeForm.onSubmit((values) =>
            checkVerificationOtpMutation.mutate({
              otp: values.code,
            }),
          )}
        >
          <Center mb="md">
            <PinInput
              length={6}
              size="md"
              onComplete={(value) => {
                checkVerificationCodeForm.setFieldValue("code", value);
                checkVerificationOtpMutation.mutate({
                  otp: value,
                });
              }}
              {...checkVerificationCodeForm.getInputProps("code")}
            />
          </Center>

          <Group justify="end">
            <Button
              type="submit"
              loading={checkVerificationOtpMutation.isPending}
            >
              Verify
            </Button>
          </Group>
        </form>
      </AuthContainer>
    </Center>
  );
}
