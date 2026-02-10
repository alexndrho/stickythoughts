import { type Metadata } from "next";
import { Paper, Text, Title } from "@mantine/core";

import { getHighlightedThought } from "@/server/thought";
import Thoughts from "./thoughts";
import ThoughtCount from "./thought-count";
import HeaderCarousel from "./header-carousel";
import classes from "./home.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const highlightedThought = await getHighlightedThought();

  return (
    <div className={classes.container}>
      <Paper component="header" withBorder className={classes.header}>
        <div>
          <Text size="xs" className={classes["header__eyebrow"]}>
            STICKYTHOUGHTS
          </Text>

          <Title className={classes["header__title"]}>
            A place where you can freely express yourself
          </Title>

          <Text className={classes["header__description"]}>
            Share a thought, start a letter, or find the voices you care about.
            Everything begins with a line.
          </Text>

          <ThoughtCount />
        </div>

        <HeaderCarousel highlightedThought={highlightedThought ?? undefined} />
      </Paper>

      <Thoughts />
    </div>
  );
}
