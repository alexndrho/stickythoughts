import "server-only";

import { prisma } from "@/lib/db";
import type { SearchAllType } from "@/types/search";

const MAX_RESULTS = 10;

export async function searchUsers(args: { q: string; take?: number }) {
  const take = args.take ?? MAX_RESULTS;

  const users = await prisma.user.findMany({
    take,
    where: {
      OR: [
        { name: { contains: args.q, mode: "insensitive" } },
        { username: { contains: args.q, mode: "insensitive" } },
      ],
    },
    select: {
      name: true,
      displayUsername: true,
      username: true,
      image: true,
    },
  });

  return users.map((user) => ({ ...user, type: "users" as const }));
}

export async function searchLetters(args: { q: string; take?: number }) {
  const take = args.take ?? MAX_RESULTS;

  const letters = await prisma.letter.findMany({
    take,
    where: {
      title: { contains: args.q, mode: "insensitive" },
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
    },
  });

  return letters.map((letter) => ({ ...letter, type: "letters" as const }));
}

export async function searchAll(args: { q: string }) {
  const takeEach = MAX_RESULTS / 2;

  const [users, letters] = await Promise.all([
    prisma.user.findMany({
      take: takeEach,
      where: {
        OR: [
          { name: { contains: args.q, mode: "insensitive" } },
          { username: { contains: args.q, mode: "insensitive" } },
        ],
      },
      select: {
        name: true,
        displayUsername: true,
        username: true,
        image: true,
      },
    }),
    prisma.letter.findMany({
      take: takeEach,
      where: {
        title: { contains: args.q, mode: "insensitive" },
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
      },
    }),
  ]);

  const combinedResults: SearchAllType[] = [
    ...users.map((user) => ({ ...user, type: "users" as const })),
    ...letters.map((letter) => ({ ...letter, type: "letters" as const })),
  ];

  return combinedResults;
}

