import "server-only";

import type { LetterStatus } from "@/generated/prisma/client";
import { ADMIN_DELETED_PER_PAGE } from "@/config/admin";
import { prisma } from "@/lib/db";

export async function listDeletedLetters(args: { page: number }) {
  const page = Math.max(args.page, 1);
  const skip = (page - 1) * ADMIN_DELETED_PER_PAGE;

  return prisma.letter.findMany({
    where: {
      deletedAt: {
        not: null,
      },
    },
    orderBy: {
      deletedAt: "desc",
    },
    take: ADMIN_DELETED_PER_PAGE,
    skip,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      deletedBy: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });
}

export async function countDeletedLetters() {
  return prisma.letter.count({
    where: {
      deletedAt: {
        not: null,
      },
    },
  });
}

export async function getDeletedLetterStatus(args: { letterId: string }) {
  return prisma.letter.findUnique({
    where: { id: args.letterId },
    select: { deletedAt: true },
  });
}

export async function restoreLetter(args: { letterId: string }) {
  await prisma.letter.update({
    where: { id: args.letterId },
    data: { deletedAt: null, deletedById: null },
  });
}

export async function purgeLetter(args: { letterId: string }) {
  await prisma.letter.delete({
    where: { id: args.letterId },
  });
}

export async function listSubmissionLetters(args: {
  page: number;
  status: Extract<LetterStatus, "PENDING" | "REJECTED">;
}) {
  const page = Math.max(args.page, 1);
  const skip = (page - 1) * ADMIN_DELETED_PER_PAGE;

  return prisma.letter.findMany({
    where: {
      deletedAt: null,
      status: args.status,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: ADMIN_DELETED_PER_PAGE,
    skip,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      statusSetBy:
        args.status === "REJECTED"
          ? {
              select: {
                id: true,
                name: true,
                username: true,
              },
            }
          : false,
    },
  });
}

export async function countSubmissionLetters(args: {
  status: Extract<LetterStatus, "PENDING" | "REJECTED">;
}) {
  return prisma.letter.count({
    where: {
      deletedAt: null,
      status: args.status,
    },
  });
}

export async function getSubmissionLetterStatus(args: { letterId: string }) {
  return prisma.letter.findUnique({
    where: { id: args.letterId },
    select: { deletedAt: true, status: true },
  });
}

export async function setSubmissionLetterStatus(args: {
  letterId: string;
  status: Extract<LetterStatus, "APPROVED" | "REJECTED">;
  statusSetById: string;
}) {
  await prisma.letter.update({
    where: { id: args.letterId, deletedAt: null },
    data: {
      status: args.status,
      statusSetById: args.statusSetById,
      postedAt: args.status === "APPROVED" ? new Date() : null,
    },
  });
}

export async function reopenSubmissionLetter(args: { letterId: string }) {
  await prisma.letter.update({
    where: { id: args.letterId, deletedAt: null, status: "REJECTED" },
    data: {
      status: "PENDING",
      statusSetById: null,
      postedAt: null,
    },
  });
}
