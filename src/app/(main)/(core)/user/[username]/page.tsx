import { headers } from "next/headers";
import { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { userUsernameOptions } from "@/app/(main)/(core)/user/options";
import { getQueryClient } from "@/lib/get-query-client";
import { getUser } from "@/services/user";
import Content from "./content";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;
  const headerList = await headers();
  const cookie = headerList.get("cookie");

  const queryClient = getQueryClient();

  try {
    const user = await queryClient.ensureQueryData({
      ...userUsernameOptions(username),
      queryFn: () => getUser(username, cookie ?? undefined),
    });

    const tabParam = resolvedSearchParams.tab || "";
    let canonical = `/user/${username}`;
    if (tabParam === "comments") {
      canonical = `/user/${username}?tab=comments`;
    } else if (tabParam === "likes") {
      canonical = `/user/${username}?tab=likes`;
    }

    return {
      title: user.name
        ? `${user.name} (@${user.username})`
        : `@${user.username}`,
      alternates: {
        canonical,
      },
    };
  } catch {
    notFound();
  }
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const headerList = await headers();
  const cookie = headerList.get("cookie");

  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      ...userUsernameOptions(username),
      queryFn: () => getUser(username, cookie ?? undefined),
    });
  } catch {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Content username={username} />
    </HydrationBoundary>
  );
}
