import type { Prisma } from "@/generated/prisma/client";

export type PrivateThoughtPayload = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    highlightedAt: true;
    createdAt: true;
    highlightedBy: {
      select: {
        id: true;
        name: true;
        username: true;
      };
    };
  };
}>;

export type PrivateThoughtFromServer = Omit<
  PrivateThoughtPayload,
  "highlightedAt" | "createdAt"
> & {
  highlightedAt: string | null;
  createdAt: string;
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
