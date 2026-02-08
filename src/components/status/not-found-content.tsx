"use client";

import Link from "next/link";
import { Button, Text, Title } from "@mantine/core";

import classes from "@/styles/status/not-found-content.module.css";

export default function NotFoundContent() {
  return (
    <div className={classes.container}>
      <Title c="blue" className={classes.title}>
        <span className={classes["title__status-code"]}>404</span>
        Page Not Found
      </Title>

      <Text size="xl" className={classes.description}>
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </Text>

      <Button component={Link} href="/" variant="default">
        Return to home
      </Button>
    </div>
  );
}
