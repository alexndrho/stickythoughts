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

export type PrivateThoughtFromServer = Omit<
  PrivateThoughtPayload,
  "createdAt"
> & {
  createdAt: string;
};

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

export type PrivateHighlightedThoughtFromServer = Omit<
  PrivateHighlightedThoughtPayload,
  "createdAt" | "highlightedAt"
> & {
  createdAt: string;
  highlightedAt: string;
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

// Override date type to string from the API response
export type PublicThoughtFromServer = Omit<
  PublicThoughtPayload,
  "createdAt"
> & {
  createdAt: string;
};
