import type { Prisma } from "@/generated/prisma/client";

export type PrivateThoughtPayload = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    createdAt: true;
  };
}>;

type PrivateHighlightedThoughtPayloadBase = Prisma.ThoughtGetPayload<{
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

export type PrivateHighlightedThoughtPayload = Omit<
  PrivateHighlightedThoughtPayloadBase,
  "highlightedAt" | "highlightedBy"
> & {
  highlightedAt: NonNullable<
    PrivateHighlightedThoughtPayloadBase["highlightedAt"]
  >;
  highlightedBy: NonNullable<
    PrivateHighlightedThoughtPayloadBase["highlightedBy"]
  >;
};

export type PublicThoughtPayload = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    createdAt: true;
  };
}>;
