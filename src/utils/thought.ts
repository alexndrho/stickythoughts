import type { Prisma } from "@/generated/prisma/client";
import { getColorFallback } from "./color";

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

// Date data from the server HTTP response body is parsed as JSON,
// so date fields are strings and need to be converted to Date objects
export const parsePublicThoughtFromServer = (
  thought: PublicThoughtFromServer,
): PublicThoughtPayload => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
    createdAt: new Date(thought.createdAt),
  } satisfies PublicThoughtPayload;
};
