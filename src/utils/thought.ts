import type { Thought } from "@/generated/prisma/client";
import { getColorFallback } from "./color";

// Override date type to string
export type ThoughtFromServer = Omit<Thought, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

// Date data from the server HTTP response body is parsed as JSON,
// so date fields are strings and need to be converted to Date objects
export const parseThoughtFromServer = (thought: ThoughtFromServer): Thought => {
  return {
    ...thought,
    color: getColorFallback(thought.color),
    createdAt: new Date(thought.createdAt),
  } satisfies Thought;
};
