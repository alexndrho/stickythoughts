import { type Metadata } from "next";
import { Card, Paper, Text, Title } from "@mantine/core";

import Thoughts from "./thoughts";
import ThoughtCount from "./thought-count";
import classes from "./home.module.css";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
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

        <div className={classes["header__notes"]}>
          <Card withBorder className={classes["header__note"]}>
            <Text className={classes["header__note-title"]}>
              Stick a thought
            </Text>
            <Text size="sm" className={classes["header__note-description"]}>
              Share a feeling, a moment, or a question. Short or long, it&apos;s
              welcome.
            </Text>
          </Card>

          <Card withBorder className={classes["header__note"]}>
            <Text className={classes["header__note-title"]}>
              Find your people
            </Text>
            <Text size="sm" className={classes["header__note-description"]}>
              Search by author to follow voices you care about and discover new
              ones.
            </Text>
          </Card>
        </div>
      </Paper>

      <Thoughts />
    </div>
  );
}
