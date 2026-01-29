"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type SuccessContext } from "better-auth/react";
import { useMutation } from "@tanstack/react-query";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { hasLength, isEmail, isNotEmpty, useForm } from "@mantine/form";
import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAt,
  IconBrandGoogleFilled,
  IconLock,
  IconUser,
  IconX,
} from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { AuthContainer } from "../auth-container";
import classes from "../auth.module.css";

export default function Content() {
  const router = useRouter();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const signedInRedirect = () => {
    const queryClient = getQueryClient();
    queryClient.clear();
    router.push("/");
  };

  return (
    <>
      <Title className={classes.title}>Welcome back!</Title>

      <Text size="sm" className={classes.subtitle}>
        Do not have an account yet?{" "}
        <Anchor component={Link} href="/sign-up" inherit>
          Create account
        </Anchor>
      </Text>

      <AuthContainer>
        {!is2FAEnabled ? (
          <SignInForm
            enable2FA={() => setIs2FAEnabled(true)}
            signedInRedirect={signedInRedirect}
          />
        ) : (
          <TwoFactorSetupForm signedInRedirect={signedInRedirect} />
        )}
      </AuthContainer>
    </>
  );
}

function SignInForm({
  enable2FA,
  signedInRedirect,
}: {
  enable2FA: () => void;
  signedInRedirect: () => void;
}) {
  const turnstileRef = useRef<TurnstileInstance>(null);

  const form = useForm({
    initialValues: {
      emailOrUsername: "",
      password: "",
      turnstileToken: "",
      rememberMe: false,
    },
    validate: {
      emailOrUsername: isNotEmpty("Email or username is required"),
      password: isNotEmpty("Password is required"),
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onSuccessSignIn(context: SuccessContext<any>) {
    if (context.data.twoFactorRedirect) {
      enable2FA();
    } else {
      signedInRedirect();
    }
  }

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      if (isEmail()(values.emailOrUsername) === null) {
        return authClient.signIn.email({
          email: values.emailOrUsername,
          password: values.password,
          rememberMe: values.rememberMe,
          fetchOptions: {
            headers: {
              "x-captcha-response": values.turnstileToken,
            },
            onSuccess: onSuccessSignIn,
          },
        });
      } else {
        return authClient.signIn.username({
          username: values.emailOrUsername,
          password: values.password,
          rememberMe: values.rememberMe,
          fetchOptions: {
            headers: {
              "x-captcha-response": values.turnstileToken,
            },
            onSuccess: onSuccessSignIn,
          },
        });
      }
    },
    onSuccess: ({ error }) => {
      if (error) {
        if (
          error.code === "INVALID_EMAIL_OR_PASSWORD" ||
          error.code === "INVALID_USERNAME_OR_PASSWORD"
        ) {
          form.setErrors({
            emailOrUsername: error.message,
            password: error.message,
          });
        } else if (
          error.code === "INVALID_USERNAME" ||
          error.code === "THIS_USERNAME_IS_NOT_ALLOWED"
        ) {
          form.setErrors({
            emailOrUsername: error.message,
          });
        } else {
          console.log(error);
          form.setFieldError("root", error.message);
        }

        form.setFieldValue("turnstileToken", "");
        turnstileRef.current?.reset();
        return;
      }
    },
    onError: (error) => {
      console.error(error);
      form.setFieldError("root", "An error occurred. Please try again.");
    },
  });

  const signInAnonymouslyMutation = useMutation({
    mutationFn: (token: string) =>
      authClient.signIn.anonymous({
        fetchOptions: {
          headers: {
            "x-captcha-response": token,
          },
          onSuccess: onSuccessSignIn,
        },
      }),
    onSuccess: ({ error }) => {
      if (error) {
        notifications.show({
          icon: <IconX size="1em" />,
          title: "Error",
          message: error.message,
          color: "red",
        });
      } else {
        signedInRedirect();
      }
    },
    onError: (error) => {
      console.error(error);
      notifications.show({
        icon: <IconX size="1em" />,
        title: "Error",
        message: "An error occurred. Please try again.",
        color: "red",
      });
    },
  });

  const signInWithGoogle = async () => {
    try {
      const data = await authClient.signIn.social({
        provider: "google",
      });

      if (data.error) {
        notifications.show({
          icon: <IconX size="1em" />,
          title: "Error",
          message: data.error.message,
          color: "red",
        });
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        icon: <IconX size="1em" />,
        title: "Error",
        message: "An error occurred. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
        <TextInput
          label="Email or Username"
          withAsterisk
          leftSection={<IconAt size="1em" />}
          {...form.getInputProps("emailOrUsername")}
          className={classes["text-input"]}
        />

        <PasswordInput
          label="Password"
          withAsterisk
          leftSection={<IconLock size="1em" />}
          {...form.getInputProps("password")}
          className={classes["text-input"]}
        />

        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_AUTH_KEY!}
          className={classes.captcha}
          onSuccess={(token) => form.setFieldValue("turnstileToken", token)}
          onExpire={() => turnstileRef.current?.reset()}
          onError={() =>
            form.setFieldError("turnstileToken", "Captcha verification failed")
          }
        />

        {(form.errors.root || form.errors.turnstileToken) && (
          <Text size="xs" className={classes["root-error-messsage"]}>
            {form.errors.root || form.errors.turnstileToken}
          </Text>
        )}

        <Group mt="md" justify="space-between">
          <Checkbox
            label="Remember me"
            {...form.getInputProps("rememberMe", { type: "checkbox" })}
          />

          <Anchor component={Link} href="/forgot-password" size="sm">
            Forgot Password?
          </Anchor>
        </Group>

        <Button
          fullWidth
          mt="md"
          type="submit"
          loading={mutation.isPending}
          disabled={form.values.turnstileToken === ""}
        >
          Sign in
        </Button>
      </form>

      <Divider my="md" label="Or continue with email" />

      <Group justify="space-between">
        <Button
          variant="default"
          flex={1}
          leftSection={<IconUser size="1em" />}
          loading={signInAnonymouslyMutation.isPending}
          disabled={form.values.turnstileToken === ""}
          onClick={() =>
            signInAnonymouslyMutation.mutate(form.values.turnstileToken)
          }
        >
          Anonymous
        </Button>

        <Button
          variant="default"
          flex={1}
          leftSection={<IconBrandGoogleFilled size="1em" />}
          onClick={signInWithGoogle}
        >
          Google
        </Button>
      </Group>
    </>
  );
}

function TwoFactorSetupForm({
  signedInRedirect,
}: {
  signedInRedirect: () => void;
}) {
  const twoFactorForm = useForm({
    initialValues: {
      authenticatorCode: "",
      trustDevice: false,
    },
    validate: {
      authenticatorCode: hasLength(6, "Code must be 6 digits"),
    },
  });

  const twoFactormutation = useMutation({
    mutationFn: (values: typeof twoFactorForm.values) =>
      authClient.twoFactor.verifyTotp({
        code: values.authenticatorCode,
      }),
    onSuccess: ({ error }) => {
      if (error?.message) {
        twoFactorForm.setErrors({ authenticatorCode: error.message });
      } else if (error) {
        twoFactorForm.setErrors({
          authenticatorCode: "Failed to verify the authenticator code.",
        });
      } else {
        signedInRedirect();
      }
    },
  });

  const backUpCodeForm = useForm({
    initialValues: {
      code: "",
      trustDevice: false,
    },
    validate: {
      code: isNotEmpty("Backup code is required"),
    },
  });

  const backUpCodeMutation = useMutation({
    mutationFn: (values: typeof backUpCodeForm.values) =>
      authClient.twoFactor.verifyBackupCode({
        ...values,
        disableSession: false,
      }),
    onSuccess: ({ error }) => {
      if (error?.message) {
        backUpCodeForm.setErrors({ code: error.message });
      } else if (error) {
        backUpCodeForm.setErrors({
          code: "Failed to verify the backup code.",
        });
      } else {
        signedInRedirect();
      }
    },
  });

  return (
    <>
      <form
        onSubmit={twoFactorForm.onSubmit((values) =>
          twoFactormutation.mutate(values),
        )}
      >
        <TextInput
          label="Enter your authenticator code"
          description="Open your authenticator app and enter the 6-digit code."
          maxLength={6}
          {...twoFactorForm.getInputProps("authenticatorCode")}
          withAsterisk
        />
        <Checkbox
          mt="md"
          label="Trust this device?"
          {...twoFactorForm.getInputProps("trustDevice", { type: "checkbox" })}
        />
        <Group justify="right" mt="md">
          <Button type="submit" loading={twoFactormutation.isPending}>
            Activate
          </Button>
        </Group>
      </form>

      <Divider label="Or use a backup code" my="md" />

      <form
        onSubmit={backUpCodeForm.onSubmit((values) =>
          backUpCodeMutation.mutate(values),
        )}
      >
        <TextInput
          label="Enter backup code"
          description="If you cannot access your authenticator app, you can use one of your backup codes. Each code can only be used once."
          maxLength={12}
          withAsterisk
          {...backUpCodeForm.getInputProps("code")}
        />

        <Checkbox
          mt="md"
          label="Trust this device?"
          {...backUpCodeForm.getInputProps("trustDevice", { type: "checkbox" })}
        />

        <Group justify="right" mt="md">
          <Button
            variant="default"
            type="submit"
            loading={backUpCodeMutation.isPending}
          >
            Use Backup Code
          </Button>
        </Group>
      </form>
    </>
  );
}
