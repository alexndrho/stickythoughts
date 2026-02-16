"use client";

import { useMutation } from "@tanstack/react-query";
import { ActionIcon, Paper, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { userKeys } from "@/lib/query-keys";
import classes from "./session.module.css";

export interface SessionItemProps {
  currentToken?: string;
  session: ReturnType<typeof authClient.listSessions>["data"][number];
}

export default function SessionItem({
  currentToken,
  session,
}: SessionItemProps) {
  const revokeMutation = useMutation({
    mutationFn: () =>
      authClient.revokeSession({
        token: session.token,
      }),
    onSuccess: () => {
      const queryClient = getQueryClient();
      queryClient.invalidateQueries({
        queryKey: userKeys.sessions(),
      });
    },
  });

  return (
    <Paper component="article" withBorder className={classes["session-item"]}>
      <div>
        {session.token === currentToken && (
          <Text className={classes["session-item__current-device-label"]}>
            Current Device
          </Text>
        )}

        <Text>
          <Text span inherit className={classes["session-item__label"]}>
            User Agent:
          </Text>{" "}
          {session.userAgent || "Unknown Device"}
        </Text>

        <Text>
          <Text span inherit className={classes["session-item__label"]}>
            IP Address:
          </Text>{" "}
          {session.ipAddress || "Unknown IP"}
        </Text>

        <Text>
          <Text span inherit className={classes["session-item__label"]}>
            Last Active:
          </Text>{" "}
          {session.updatedAt.toLocaleString()}
        </Text>
      </div>

      {session.token !== currentToken && (
        <ActionIcon
          variant="transparent"
          size="lg"
          loading={revokeMutation.isPending}
          className={classes["session-item__revoke"]}
          onClick={() => revokeMutation.mutate()}
        >
          <IconX size="1.25em" />
        </ActionIcon>
      )}
    </Paper>
  );
}
