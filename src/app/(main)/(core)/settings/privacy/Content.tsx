"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Button, Divider, Skeleton, Text, Title } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { userSettingsPrivacy } from "./options";
import LikesVisibilityModal from "./LikesVisibilityModal";
import classes from "../settings.module.css";
import privacyClasses from "./privacy.module.css";

export default function Content() {
  const router = useRouter();
  const { data: currentSession, isPending: isCurrentSessionPending } =
    authClient.useSession();
  const [LikesVisibilityOpened, likesVisibilityHandler] = useDisclosure(false);

  const { data: settings, isFetching } = useQuery(userSettingsPrivacy);

  useEffect(() => {
    if (!isCurrentSessionPending && !currentSession) {
      router.push("/");
    }
  }, [isCurrentSessionPending, currentSession, router]);

  return (
    <div className={classes.container}>
      <Title size="h2" className={classes.title}>
        Privacy
      </Title>

      <Divider mb="md" />

      <Title order={2} size="h3">
        Interactions
      </Title>

      <Text size="lg" className={classes.label}>
        Likes
      </Text>

      <Text size="md" className={classes.description}>
        Who can see your likes.
      </Text>

      <Skeleton display="inline-block" mt="xs" w="auto" visible={isFetching}>
        <Button
          variant="default"
          rightSection={<IconChevronRight size="1em" />}
          className={privacyClasses["settings-visibility-button"]}
          onClick={likesVisibilityHandler.open}
        >
          {(settings?.likesVisibility || "PUBLIC").toLowerCase()}
        </Button>
      </Skeleton>

      <LikesVisibilityModal
        initialVisibility={settings?.likesVisibility}
        opened={LikesVisibilityOpened}
        onClose={likesVisibilityHandler.close}
      />
    </div>
  );
}
