import { headers } from "next/headers";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import Content from "./content";
import { getQueryClient } from "@/lib/get-query-client";
import { letterOptions } from "@/app/(main)/(core)/letters/options";
import { getLetter } from "@/services/letter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ letterId: string }>;
}): Promise<Metadata> {
  const { letterId } = await params;
  const headerList = await headers();
  const cookie = headerList.get("cookie");
  const queryClient = getQueryClient();

  try {
    const letter = await queryClient.ensureQueryData({
      ...letterOptions(letterId),
      queryFn: () => getLetter(letterId, cookie ?? undefined),
    });
    return {
      title: `${letter.title}`,
      alternates: {
        canonical: `/letters/${letterId}`,
      },
    };
  } catch {
    notFound();
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ letterId: string }>;
}) {
  const { letterId } = await params;
  const headerList = await headers();
  const cookie = headerList.get("cookie");
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      ...letterOptions(letterId),
      queryFn: () => getLetter(letterId, cookie ?? undefined),
    });
  } catch {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Content id={letterId} />
    </HydrationBoundary>
  );
}
