"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  Anchor,
  Button,
  Divider,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconAt,
  IconBrandGoogleFilled,
  IconLock,
  IconMail,
  IconX,
} from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { AuthContainer } from "../AuthContainer";
import classes from "../auth.module.css";

export default function Content() {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const form = useForm({
    initialValues: {
      email: "",
      username: "",
      password: "",
      turnstileToken: "",
    },
    validate: {
      email: isEmail("Invalid email"),
      username: isNotEmpty("Username is required"),
      password: isNotEmpty("Password is required"),
    },
  });

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      authClient.signUp.email({
        name: "",
        ...values,
        callbackURL: "/",
        fetchOptions: {
          headers: {
            "x-captcha-response": values.turnstileToken,
          },
        },
      }),

    onSuccess: ({ error }) => {
      if (error) {
        if (error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
          form.setErrors({
            email: "Email is already in use. Please use a different email.",
          });
        } else if (
          error.code === "USERNAME_CANNOT_CONTAIN_SPACES" ||
          error.code === "THIS_USERNAME_IS_NOT_ALLOWED"
        ) {
          form.setErrors({
            username: error.message,
          });
        } else if (error.code === "PASSWORD_TOO_SHORT") {
          form.setErrors({
            password: error.message,
          });
        } else {
          form.setFieldError("root", error.message);

          form.setFieldValue("turnstileToken", "");
          turnstileRef.current?.reset();
        }

        return;
      }

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
      <Title className={classes.title}>Sign up</Title>

      <Text size="sm" className={classes.subtitle}>
        Already have an account?{" "}
        <Anchor component={Link} href="/sign-in" inherit>
          Sign in
        </Anchor>
      </Text>

      <AuthContainer>
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
          <TextInput
            label="Email"
            description="This will not be shown publicly"
            withAsterisk
            leftSection={<IconMail size="1em" />}
            {...form.getInputProps("email")}
            className={classes["text-input"]}
          />

          <TextInput
            label="Username"
            withAsterisk
            leftSection={<IconAt size="1em" />}
            {...form.getInputProps("username")}
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
            siteKey={
              process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_AUTH_KEY!
            }
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

          <Button
            fullWidth
            mt="md"
            type="submit"
            loading={mutation.isPending}
            disabled={form.values.turnstileToken === ""}
          >
            Sign up
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
