import { Container } from "@mantine/core";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import classes from "./auth.module.css";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session && !session.user.isAnonymous) {
    redirect("/");
  }

  return <Container className={classes.container}>{children}</Container>;
}
