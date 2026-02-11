"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { thoughtCountOptions } from "./options";
import ThoughtCount from "./thought-count";

export default function ThoughtCountClient() {
  const { data: thoughtsCountData } = useSuspenseQuery(thoughtCountOptions);

  return <ThoughtCount count={thoughtsCountData} />;
}
