"use client";

import Link from "next/link";
import { Center, Text, Title, Button, Stack } from "@mantine/core";

import { AuthContainer } from "../auth-container";

export default function StepCompleted() {
  return (
    <Center>
      <AuthContainer>
        <Stack align="center" gap="md">
          <Title order={2} ta="center">
            Password Changed Successfully!
          </Title>
          <Text ta="center" c="dimmed">
            Your password has been updated. You can now sign in with your new
            password.
          </Text>
          <Button component={Link} href="/sign-in" size="md" mt="md">
            Sign In
          </Button>
        </Stack>
      </AuthContainer>
    </Center>
  );
}
