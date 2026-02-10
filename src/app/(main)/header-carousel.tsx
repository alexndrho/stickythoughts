"use client";

import { Carousel } from "@mantine/carousel";
import { Card, Text } from "@mantine/core";

import classes from "./home.module.css";
import Thought from "./thought";
import type { HighlightedThought } from "@/lib/queries/thought";

export type HeaderCarouselProps = {
  highlightedThought?: HighlightedThought;
};

export default function HeaderCarousel({
  highlightedThought,
}: HeaderCarouselProps) {
  return (
    <Carousel
      className={classes.header__carousel}
      slideGap="md"
      withIndicators
      classNames={{
        root: classes.header__carousel__root,
        controls: classes.header__carousel__controls,
        control: classes.header__carousel__control,
      }}
    >
      <Carousel.Slide className={classes["header__carousel__slide"]}>
        <div className={classes["header__notes"]}>
          <Text className={classes["header__highlight-title"]}>
            A thought worth keeping
          </Text>
          <div className={classes["header__highlight"]}>
            {highlightedThought ? (
              <Thought
                message={highlightedThought.message}
                author={highlightedThought.author}
                color={highlightedThought.color}
                createdAt={highlightedThought.createdAt}
              />
            ) : (
              <Thought
                message="No highlighted thought yet. Share something meaningful and it could land here."
                author="The community"
              />
            )}
          </div>
        </div>
      </Carousel.Slide>

      <Carousel.Slide className={classes.header__slide}>
        <div className={classes.header__notes}>
          <Card withBorder className={classes.header__note}>
            <Text className={classes["header__note-title"]}>
              Highlights live here
            </Text>
            <Text size="sm" className={classes["header__note-description"]}>
              When a thought feels worth keeping, it finds its way here. It is a
              small spotlight for what resonates.
            </Text>
          </Card>

          <Card withBorder className={classes.header__note}>
            <Text className={classes["header__note-title"]}>
              Stick a thought
            </Text>
            <Text size="sm" className={classes["header__note-description"]}>
              Share a feeling, a moment, or a quiet confession. Short or long,
              it&apos;s welcome. It is your space to leave something honest,
              useful, or simply curious.
            </Text>
          </Card>
        </div>
      </Carousel.Slide>
    </Carousel>
  );
}
