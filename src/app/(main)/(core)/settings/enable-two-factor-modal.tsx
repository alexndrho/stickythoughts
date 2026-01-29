"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { hasLength, isNotEmpty, useForm } from "@mantine/form";
import QRCode from "react-qr-code";
import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  PasswordInput,
  Stepper,
  Text,
  TextInput,
} from "@mantine/core";

import { authClient } from "@/lib/auth-client";
import classes from "./account.module.css";
import { notifications } from "@mantine/notifications";

export interface UpdateNameModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function EnableTwoFactorModal({
  opened,
  onClose,
}: UpdateNameModalProps) {
  const [stepperActive, setStepperActive] = useState(0);
  const [totpUri, setTotpUri] = useState<string | null>(null);

  const nextStep = () =>
    setStepperActive((current) => (current < 1 ? current + 1 : current));

  return (
    <Modal
      title="Enable Two-Factor Authentication"
      opened={opened}
      onClose={onClose}
      centered
    >
      <Stepper
        active={stepperActive}
        allowNextStepsSelect={false}
        classNames={{
          steps: classes["enable-two-factor-modal__steps"],
          content: classes["enable-two-factor-modal__content"],
        }}
      >
        <Stepper.Step>
          <StepOne setTotpUri={setTotpUri} setNextStep={nextStep} />
        </Stepper.Step>

        <Stepper.Step>
          <StepTwo totpUri={totpUri} onClose={onClose} />
        </Stepper.Step>
      </Stepper>
    </Modal>
  );
}

function StepOne({
  setTotpUri,
  setNextStep,
}: {
  setTotpUri: (uri: string) => void;
  setNextStep: () => void;
}) {
  const form = useForm({
    initialValues: {
      password: "",
    },
    validate: { password: isNotEmpty("Password is required") },
  });

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      const twoFactorResponse = await authClient.twoFactor.enable({
        password: values.password,
      });

      if (twoFactorResponse.error) {
        return { error: twoFactorResponse.error };
      }

      const totpUriResponse = await authClient.twoFactor.getTotpUri({
        password: values.password,
      });

      if (totpUriResponse.error) {
        return { error: totpUriResponse.error };
      }

      return {
        twoFactorData: twoFactorResponse.data,
        totpURIData: totpUriResponse.data,
      };
    },
    onSuccess: async ({ totpURIData, error }) => {
      if (error?.message) {
        form.setErrors({ password: error.message });
      } else if (totpURIData) {
        setTotpUri(totpURIData.totpURI);
        setNextStep();
        form.reset();
      } else {
        form.setErrors({
          password: "An unexpected error occurred. Please try again.",
        });
      }
    },
    onError: () => {
      form.setErrors({
        password: "An unexpected error occurred. Please try again.",
      });
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        mutation.mutate(values);
      })}
    >
      <PasswordInput
        flex={1}
        label="Password"
        withAsterisk
        {...form.getInputProps("password")}
      />

      <Group mt="md" justify="end">
        <Button type="submit" loading={mutation.isPending}>
          Enable 2FA
        </Button>
      </Group>
    </form>
  );
}

function StepTwo({
  totpUri,
  onClose,
}: {
  totpUri: string | null;
  onClose: () => void;
}) {
  const form = useForm({
    initialValues: {
      authenticatorCode: "",
      trustDevice: false,
    },
    validate: {
      authenticatorCode: hasLength(6, "Code must be 6 digits"),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      authClient.twoFactor.verifyTotp({
        code: values.authenticatorCode,
        trustDevice: values.trustDevice,
      }),
    onSuccess: ({ error }) => {
      if (error?.message) {
        form.setErrors({ authenticatorCode: error.message });
      } else if (error) {
        form.setErrors({
          authenticatorCode: "Failed to verify the authenticator code.",
        });
      } else {
        onClose();

        notifications.show({
          title: "Two-Factor Authentication Enabled",
          message:
            "Two-factor authentication has been successfully enabled for your account.",
          color: "green",
        });
      }
    },
  });

  return (
    <>
      <div className={classes["enable-two-factor-modal__qr-code-step__row"]}>
        <div>
          <Text size="lg" className={classes["enable-two-factor-modal__title"]}>
            Download an authenticator app
          </Text>
          <Text>
            If you don&apos;t have one already, download an authenticator app
            such as{" "}
            <Anchor href="https://www.authy.com/" target="_blank">
              Authy
            </Anchor>{" "}
            or{" "}
            <Anchor
              href="https://support.google.com/accounts/answer/1066447"
              target="_blank"
            >
              Google Authenticator
            </Anchor>
            .
          </Text>
        </div>
      </div>

      <Divider my="md" />

      <div className={classes["enable-two-factor-modal__qr-code-step__row"]}>
        <div
          className={`${classes["qr-code-container"]} ${classes["enable-two-factor-modal__qr-code-step__row__image"]}`}
        >
          <LoadingOverlay
            visible={totpUri === null}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />

          <QRCode value={totpUri || ""} className={classes["qr-code"]} />
        </div>

        <div
          className={
            classes["enable-two-factor-modal__qr-code-step__row__content"]
          }
        >
          <Text size="lg" className={classes["enable-two-factor-modal__title"]}>
            Scan the QR code
          </Text>

          <Text>
            Use an authenticator app to scan the QR code and set up two-factor
            authentication for your account.
          </Text>
        </div>
      </div>

      <Divider my="md" />

      <form
        onSubmit={form.onSubmit((values) => {
          mutation.mutate(values);
        })}
      >
        <TextInput
          label="Enter your authenticator code"
          description="After scanning the QR code, enter the 6-digit code generated by your authenticator app to verify and complete the setup."
          maxLength={6}
          {...form.getInputProps("authenticatorCode")}
          withAsterisk
        />

        <Checkbox
          mt="md"
          label="Trust this device?"
          {...form.getInputProps("trustDevice", { type: "checkbox" })}
        />

        <Group justify="right" mt="md">
          <Button type="submit" loading={mutation.isPending}>
            Activate
          </Button>
        </Group>
      </form>
    </>
  );
}
