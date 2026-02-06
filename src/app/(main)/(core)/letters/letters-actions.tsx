"use client";

import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { spotlight } from "@mantine/spotlight";
import { Button, Kbd } from "@mantine/core";
import { IconMail, IconSearch } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import SignInWarningModal from "@/components/sign-in-warning-modal";
import SearchSpotlight from "./search-spotlight";
import classes from "./letters.module.css";

export default function LettersActions() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [signInWarningModalOpened, signInWarningModalHandler] =
    useDisclosure(false);

  const handleClickSubmitPost = () => {
    if (!session) {
      signInWarningModalHandler.open();
      return;
    }

    router.push("/letters/submit");
  };

  return (
    <>
      <div className={classes["actions-bar"]}>
        <Button
          variant="default"
          leftSection={<IconSearch size="1em" />}
          rightSection={<Kbd>t</Kbd>}
          onClick={spotlight.open}
          aria-label="Open search"
          classNames={{
            root: classes["actions-bar__search-btn"],
            label: classes["actions-bar__search-btn__label"],
          }}
        >
          Search...
        </Button>

        <Button
          rightSection={<IconMail size="1em" />}
          onClick={handleClickSubmitPost}
        >
          Write a letter
        </Button>
      </div>

      <SearchSpotlight />

      {!session && (
        <SignInWarningModal
          opened={signInWarningModalOpened}
          onClose={signInWarningModalHandler.close}
        />
      )}
    </>
  );
}
