import { type Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import Content from "./content";

export const metadata: Metadata = {
  title: "Submissions",
  alternates: {
    canonical: "/dashboard/submissions",
  },
};

export default async function SubmissionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const hasPermission = await auth.api.userHasPermission({
    body: {
      userId: session?.user.id,
      permission: {
        letter: ["list-submissions"],
      },
    },
  });

  if (!hasPermission.success) {
    notFound();
  }

  return <Content />;
}
