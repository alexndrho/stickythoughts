import { type Metadata } from "next";
import { subDays } from "date-fns";
import { Paper, Text, Title } from "@mantine/core";

import { getHighlightedThought } from "@/lib/queries/thought";
import Thoughts from "./thoughts";
import ThoughtCount from "./thought-count";
import HeaderCarousel from "./header-carousel";
import { HIGHLIGHT_MAX_AGE_DAYS } from "@/config/thought";
import classes from "./home.module.css";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 86400; // 24 hours in seconds

export default async function HomePage() {
  const highlightCutoff = subDays(new Date(), HIGHLIGHT_MAX_AGE_DAYS);

  const highlightedThought = await getHighlightedThought({ highlightCutoff });

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
