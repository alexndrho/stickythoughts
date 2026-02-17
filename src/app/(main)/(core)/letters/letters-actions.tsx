"use client";

import Link from "next/link";
import { spotlight } from "@mantine/spotlight";
import { Button, Kbd } from "@mantine/core";
import { IconMail, IconSearch } from "@tabler/icons-react";

import SearchSpotlight from "./search-spotlight";
import classes from "./letters.module.css";

export default function LettersActions() {
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
          component={Link}
          href="/letters/submit"
          rightSection={<IconMail size="1em" />}
        >
          Write a letter
        </Button>
      </div>

      <SearchSpotlight />
    </>
  );
}
