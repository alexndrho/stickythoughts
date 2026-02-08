import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import Content from "./content";
import { getQueryClient } from "@/lib/get-query-client";
import { letterOptions } from "@/app/(main)/(core)/letters/options";
import {
  getLetterServer,
  LetterNotFoundError,
} from "@/app/(main)/(core)/letters/[letterId]/letter.server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ letterId: string }>;
}): Promise<Metadata> {
  const { letterId } = await params;

  try {
    const letter = await getLetterServer(letterId);
    return {
      title: `${letter.title}`,
      alternates: {
        canonical: `/letters/${letterId}`,
      },
    };
  } catch (err) {
    if (err instanceof LetterNotFoundError) {
      notFound();
    }
    throw err;
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ letterId: string }>;
}) {
  const { letterId } = await params;
  const queryClient = getQueryClient();

  try {
    const letter = await getLetterServer(letterId);
    queryClient.setQueryData(letterOptions(letterId).queryKey, letter);
  } catch (err) {
    if (err instanceof LetterNotFoundError) {
      notFound();
    }
    throw err;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Content id={letterId} />
    </HydrationBoundary>
  );
}
