import { Suspense } from "react";
import { type Metadata } from "next";
import { Paper, Text, Title } from "@mantine/core";

import ThoughtCount from "./thought-count";
import HeaderCarousel from "./header-carousel";
import ThoughtCountServer from "./thought-count.server";
import HeaderCarouselServer from "./header-carousel.server";
import classes from "./home.module.css";
import ThoughtsServer from "./thoughts.server";
import ThoughtsLoader from "./thoughts-loader";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
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

          <Suspense fallback={<ThoughtCount loading={true} />}>
            <ThoughtCountServer />
          </Suspense>
        </div>

        <Suspense fallback={<HeaderCarousel loading={true} />}>
          <HeaderCarouselServer />
        </Suspense>
      </Paper>

      <Suspense fallback={<ThoughtsLoader />}>
        <ThoughtsServer />
      </Suspense>
    </div>
  );
}
