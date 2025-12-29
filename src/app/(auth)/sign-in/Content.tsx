"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
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
import { IconBrandGoogleFilled, IconX } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { AuthContainer } from "../AuthContainer";
import classes from "../auth.module.css";

export default function Content() {
  const router = useRouter();
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
        } else {
          form.setFieldError("root", error.message);
        }

        form.setFieldValue("turnstileToken", "");
        turnstileRef.current?.reset();
        return;
      }

      const queryClient = getQueryClient();
      queryClient.clear();

      router.push("/");
    },
    onError: (error) => {
      console.error(error);
      form.setFieldError("root", "An error occurred. Please try again.");
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
      <Title className={classes.title}>Welcome back!</Title>

      <Text size="sm" className={classes.subtitle}>
        Do not have an account yet?{" "}
        <Anchor component={Link} href="/sign-up" inherit>
          Create account
        </Anchor>
      </Text>

      <AuthContainer>
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
          <TextInput
            label="Email or Username"
            withAsterisk
            {...form.getInputProps("emailOrUsername")}
            className={classes["text-input"]}
          />

          <PasswordInput
            label="Password"
            withAsterisk
            {...form.getInputProps("password")}
            className={classes["text-input"]}
          />

          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
            className={classes.captcha}
            onSuccess={(token) => form.setFieldValue("turnstileToken", token)}
            onExpire={() => turnstileRef.current?.reset()}
            onError={() =>
              form.setFieldError(
                "turnstileToken",
                "Captcha verification failed",
              )
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

        <Button
          fullWidth
          variant="default"
          leftSection={<IconBrandGoogleFilled size="1em" />}
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </Button>
      </AuthContainer>
    </>
  );
}
