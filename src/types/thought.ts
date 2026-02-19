import type { Prisma } from "@/generated/prisma/client";
import type { input } from "zod";
import type { createThoughtInput } from "@/lib/validations/thought";
import type { SerializeDates } from "./serialization";
import type { UserSummary } from "./user";

export type BasePrivateThought = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    createdAt: true;
  };
}>;

export type PrivateThought = BasePrivateThought;

export type PrivateThoughtDTO = SerializeDates<PrivateThought>;

export type BasePrivateHighlightedThought = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    createdAt: true;
    highlightedAt: true;
    highlightedBy: {
      select: {
        id: true;
        name: true;
        username: true;
      };
    };
  };
}>;

export type PrivateHighlightedThought = Omit<
  BasePrivateHighlightedThought,
  "highlightedAt" | "highlightedBy"
> & {
  highlightedAt: NonNullable<BasePrivateHighlightedThought["highlightedAt"]>;
  highlightedBy: UserSummary;
};

export type PrivateHighlightedThoughtDTO =
  SerializeDates<PrivateHighlightedThought>;

export type BasePublicThought = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    createdAt: true;
  };
}>;

export type PublicThought = BasePublicThought;

export type PublicThoughtDTO = SerializeDates<PublicThought>;

export type SubmitThoughtBody = input<typeof createThoughtInput>;
