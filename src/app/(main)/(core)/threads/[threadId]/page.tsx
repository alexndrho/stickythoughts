import { headers } from "next/headers";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import Content from "./Content";
import { getQueryClient } from "@/lib/get-query-client";
import { threadOptions } from "@/app/(main)/(core)/threads/options";
import { getThread } from "@/services/thread";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ threadId: string }>;
}): Promise<Metadata> {
  const { threadId } = await params;
  const headerList = await headers();
  const cookie = headerList.get("cookie");
  const queryClient = getQueryClient();

  try {
    const thread = await queryClient.ensureQueryData({
      ...threadOptions(threadId),
      queryFn: () => getThread(threadId, cookie ?? undefined),
    });
    return {
      title: `${thread.title}`,
      alternates: {
        canonical: `/threads/${threadId}`,
      },
    };
  } catch {
    notFound();
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const headerList = await headers();
  const cookie = headerList.get("cookie");
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      ...threadOptions(threadId),
      queryFn: () => getThread(threadId, cookie ?? undefined),
    });
  } catch {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Content id={threadId} />
    </HydrationBoundary>
  );
}
