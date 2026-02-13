import { Suspense } from "react";
import { type Metadata } from "next";
import { Paper, Text, Title } from "@mantine/core";

import LettersActions from "./letters-actions";
import HeaderNote from "./header-note";
import SignInCard from "./sign-in-card";
import LettersListServer from "./letters-list.server";
import { LettersSkeleton } from "./letters-skeleton";
import classes from "./letters.module.css";

export const metadata: Metadata = {
  title: "Letters",
  alternates: {
    canonical: `/letters`,
  },
};

export default function LettersPage() {
  return (
    <div className={classes.container}>
      <Paper component="header" withBorder className={classes["header"]}>
        <div>
          <Text size="xs" className={classes["header__eyebrow"]}>
            Letters
          </Text>

          <Title className={classes["header__title"]}>
            Longer stories. Slower replies.
          </Title>

          <Text className={classes.header__description}>
            When a thought needs more room, write a letter. Read, reply, and
            keep the conversation moving.
          </Text>

          <LettersActions />
        </div>

        <HeaderNote />
      </Paper>

      <SignInCard />

      <Suspense fallback={<LettersSkeleton />}>
        <LettersListServer />
      </Suspense>
    </div>
  );
}
