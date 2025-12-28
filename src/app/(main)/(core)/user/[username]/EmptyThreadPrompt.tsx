import Link from "next/link";
import { Button, Flex, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

export interface EmptyThreadPromptProps {
  isCurrentUser: boolean;
}

export default function EmptyThreadPrompt({
  isCurrentUser,
}: EmptyThreadPromptProps) {
  if (isCurrentUser) {
    return (
      <Flex direction="column" align="center">
        <Text ta="center">
          You haven&apos;t created any threads yet. Create your first thread to
          get started!
        </Text>

        <Button
          component={Link}
          mt="md"
          href="/threads/submit"
          leftSection={<IconPlus size="1em" />}
        >
          Create Thread
        </Button>
      </Flex>
    );
  }

  return (
    <Text ta="center">This user hasn&apos;t created any threads yet.</Text>
  );
}
