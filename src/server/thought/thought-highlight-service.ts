import "server-only";

import { subDays } from "date-fns";

import { prisma } from "@/lib/db";
import { THOUGHT_HIGHLIGHT_MAX_AGE_DAYS } from "@/config/thought";

export async function getHighlightedThought() {
  const highlightCutoff = subDays(new Date(), THOUGHT_HIGHLIGHT_MAX_AGE_DAYS);

  return prisma.thought.findFirst({
    where: {
      deletedAt: null,
      highlightedAt: { not: null, gte: highlightCutoff },
    },
    orderBy: {
      highlightedAt: "desc",
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      createdAt: true,
    },
  });
}

export async function findCurrentHighlight() {
  return prisma.thought.findFirst({
    where: {
      highlightedAt: { not: null },
      deletedAt: null,
    },
    select: {
      id: true,
      highlightedAt: true,
    },
    orderBy: {
      highlightedAt: "desc",
    },
  });
}

export async function getThoughtHighlightStatus(args: { thoughtId: string }) {
  return prisma.thought.findUnique({
    where: { id: args.thoughtId },
    select: { highlightedAt: true },
  });
}

export async function updateHighlight(args: {
  highlighted: boolean;
  thoughtId: string;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    if (args.highlighted) {
      await tx.thought.updateMany({
        where: {
          highlightedAt: { not: null },
          deletedAt: null,
          id: { not: args.thoughtId },
        },
        data: {
          highlightedAt: null,
          highlightedById: null,
        },
      });
    }

    return tx.thought.update({
      where: { id: args.thoughtId },
      data: args.highlighted
        ? { highlightedAt: new Date(), highlightedById: args.userId }
        : { highlightedAt: null, highlightedById: null },
      select: {
        id: true,
        author: true,
        message: true,
        color: true,
        highlightedAt: true,
        createdAt: true,
        highlightedBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });
  });
}
