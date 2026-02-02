import { type Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import Content from "./content";

export const metadata: Metadata = {
  title: "Users",
  alternates: {
    canonical: "/dashboard/users",
  },
};

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const hasPermission = await auth.api.userHasPermission({
    body: {
      userId: session?.user.id,
      permission: {
        user: ["list"],
      },
    },
  });

  if (!hasPermission.success) {
    notFound();
  }

  return <Content />;
}
