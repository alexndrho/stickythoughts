import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { Button, Skeleton, Text } from "@mantine/core";

import { type authClient } from "@/lib/auth-client";
import classes from "./account.module.css";

export interface AccountItemProps {
  title: string;
  description: string;
  connect: ReturnType<typeof authClient.linkSocial>;
  disconnect: () => void;
  connected?: boolean;
  loading?: boolean;
}

export default function AccountItem({
  title,
  description,
  connect,
  disconnect,
  connected,
  loading,
}: AccountItemProps) {
  const connectMutation = useMutation({
    mutationFn: connect,
    onError: (error) => {
      console.error(`Failed to connect to ${title}:`, error);

      notifications.show({
        title: "Error",
        message: `Failed to connect to ${title}. Please try again.`,
        color: "red",
      });
    },
  });

  return (
    <div>
      <Text size="lg" truncate className={classes["account-item__label"]}>
        {title}
      </Text>

      <Text size="md" className={classes["account-item__description"]}>
        {description}
      </Text>

      <Skeleton mt="xs" w="auto" display="inline-block" visible={loading}>
        <Button
          variant="default"
          onClick={connected ? disconnect : () => connectMutation.mutate()}
        >
          {connected ? "Disconnect" : "Connect"}
        </Button>
      </Skeleton>
    </div>
  );
}
