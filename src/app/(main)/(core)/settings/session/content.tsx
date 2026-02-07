"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Divider, Group, Loader, Title } from "@mantine/core";

import { authClient } from "@/lib/auth-client";
import { getQueryClient } from "@/lib/get-query-client";
import { userSessionsOptions } from "./options";
import SessionItem from "./session-item";
import classes from "../settings.module.css";
import sessionClasses from "./session.module.css";

export default function Content() {
  const router = useRouter();
  const { data: currentSession, isPending: isCurrentSessionPending } =
    authClient.useSession();
  const { data: sessions, isLoading: isSessionsLoading } =
    useQuery(userSessionsOptions);

  useEffect(() => {
    if (!isCurrentSessionPending && !currentSession) {
      router.push("/");
    }
  }, [isCurrentSessionPending, currentSession, router]);

  const revokeOtherSessionsMutation = useMutation({
    mutationFn: () => authClient.revokeOtherSessions(),
    onSuccess: () => {
      const queryClient = getQueryClient();
      queryClient.invalidateQueries({
        queryKey: userSessionsOptions.queryKey,
      });
    },
  });

  const currentToken = currentSession?.session.token;
  const sortedSessions = sessions?.data
    ? [...sessions.data].sort((a, b) => {
        // Place current session first if token matches
        if (currentToken === a.token && currentToken !== b.token) return -1;
        if (currentToken === b.token && currentToken !== a.token) return 1;
        // Otherwise, sort by creation date (newest first)
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      })
    : undefined;

  return (
    <div className={classes.container}>
      <Title size="h2" className={classes.title}>
        Session
      </Title>

      <Divider mb="md" />

      <Group mb="md" justify="end">
        <Button
          size="compact-sm"
          color="red"
          loading={revokeOtherSessionsMutation.isPending}
          onClick={() => revokeOtherSessionsMutation.mutate()}
        >
          Revoke All Other Sessions
        </Button>
      </Group>

      <section className={sessionClasses.sessions}>
        {sortedSessions
          ? sortedSessions.map((session) => (
              <SessionItem
                key={session.id}
                currentToken={currentToken}
                session={session}
              />
            ))
          : isSessionsLoading && (
              <Group my="xl" w="100%" justify="center">
                <Loader />
              </Group>
            )}
      </section>
    </div>
  );
}
