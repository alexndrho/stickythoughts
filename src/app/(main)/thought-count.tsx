"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, Skeleton, Text } from "@mantine/core";
import { IconMessage } from "@tabler/icons-react";

import { thoughtCountOptions } from "@/app/(main)/options";
import classes from "./home.module.css";

export default function ThoughtCount() {
  const { data: thoughtsCountData, isFetched: thoughtsCountIsFetched } =
    useQuery(thoughtCountOptions);

  return (
    <Skeleton
      visible={!thoughtsCountIsFetched}
      component={Card}
      className={classes["header__skeleton-wrapper-thought-counter"]}
    >
      <IconMessage
        size="1em"
        className={classes["header__thought-counter-icon"]}
      />

      <Text className={classes["header__thought-counter"]}>
        {thoughtsCountData ? thoughtsCountData.toLocaleString() : 0}{" "}
        <Text c="blue" span inherit>
          thoughts
        </Text>{" "}
        submitted
      </Text>
    </Skeleton>
  );
}
